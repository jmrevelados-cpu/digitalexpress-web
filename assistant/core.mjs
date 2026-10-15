export const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const money = cents => "S/ " + (cents / 100).toFixed(2);
export const INTENTS = ["quote", "sizes", "frames", "quality", "delivery", "payment", "branches", "human", "greeting", "unknown"];

export function peruDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {timeZone:"America/Lima",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
}
function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function tariffIsCurrent(tariff, now = new Date()) {
  const day = peruDate(now);
  return tariff?.approved === true && !!tariff.version && !!tariff.approvedBy && !!tariff.source &&
    validDate(tariff.validFrom) && validDate(tariff.validUntil) &&
    tariff.validFrom <= day && tariff.validUntil >= day && Array.isArray(tariff.rows);
}
function productFrom(text) {
  if (/marco|enmarc|cuadro/.test(text)) return "marcos";
  if (/ampliaci/.test(text)) return "ampliaciones";
  if (/photobook|fotolibro|album/.test(text)) return "photobooks";
  if (/foto|impres|copia/.test(text)) return "fotos";
  return null;
}
export function parseRequest(message, state = {}) {
  const text = normalize(message);
  const dimensions = text.match(/(\d+(?:[.,]\d+)?)\s*(?:x|×|por)\s*(\d+(?:[.,]\d+)?)/);
  let size = dimensions ? dimensions[1].replace(",",".") + " x " + dimensions[2].replace(",",".") + " cm" : null;
  if (dimensions && /pulgad|inches|["″]/.test(text)) size = dimensions[1] + " x " + dimensions[2] + " pulgadas";
  const amount = text.match(/(-?\d+(?:[.,]\d+)?)\s*(?:fotos|copias|unidades|uds|impresiones|marcos|ampliaciones)\b/) ||
    text.match(/(?:cantidad|son|quiero|necesito)\s*:?\s*(-?\d+(?:[.,]\d+)?)(?!\s*(?:x|por)\s*\d)\b/);
  let quantity = amount ? Number(amount[1].replace(",",".")) : null;
  const followup = text.match(/^(?:y\s+)?(-?\d+(?:[.,]\d+)?)$/);
  if (followup && state.intent === "quote") quantity = Number(followup[1].replace(",","."));
  const product = productFrom(text);
  let intent = "unknown";
  if (/asesor|persona|humano|no ia|reclamo|reclamar|queja|no me ayuda|no entiendes|hablar con alguien/.test(text)) intent = "human";
  else if (/precio|cuanto|cotiz|costo|presupuest|\d+\s*(?:fotos|copias|marcos|ampliaciones)/.test(text)) intent = "quote";
  else if (product && /quiero|necesito|imprimir|pedir/.test(text) && !/orientaci/.test(text)) intent = "quote";
  else if (/marco|enmarc|paspartu|cuadro/.test(text)) intent = "frames";
  else if (/medida|tamano|dimension|formato/.test(text)) intent = "sizes";
  else if (/calidad|resoluc|pixel|celular|archivo|recort|encuadre/.test(text)) intent = "quality";
  else if (/entrega|envio|recoj|recog|demora|horario|urgente|hoy|manana/.test(text)) intent = "delivery";
  else if (/pago|yape|plin|tarjeta|deposit|transferen/.test(text)) intent = "payment";
  else if (/sede|direccion|ubicac|chacarilla|monte grande|chorrillos/.test(text)) intent = "branches";
  else if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|gracias)[!. ]*$/.test(text)) intent = "greeting";
  else if ((size || quantity !== null || /\bmate\b|\bbrillante\b/.test(text)) && state.intent === "quote") intent = "quote";
  return {intent, product, size, quantity, finish:/\bmate\b/.test(text)?"Mate":/\bbrill/.test(text)?"Brillante":null};
}
export function getQuote(request, knowledge, now = new Date()) {
  if (!tariffIsCurrent(knowledge.tariff, now)) return {status:"unconfirmed"};
  if (!Object.hasOwn(knowledge.branches,request.branch)) return {status:"branch"};
  if (!request.product || !request.size) return {status:"size"};
  if (!Number.isSafeInteger(request.quantity) || request.quantity < 1 || request.quantity > 10000) return {status:"quantity"};
  const options = knowledge.tariff.rows.filter(row =>
    row.product === request.product && normalize(row.size) === normalize(request.size) &&
    (row.branch === "Todas" || row.branch === request.branch) &&
    Number.isSafeInteger(row.minQuantity) && row.minQuantity >= 1 &&
    (row.maxQuantity === null || (Number.isSafeInteger(row.maxQuantity) && row.maxQuantity >= row.minQuantity)) &&
    request.quantity >= row.minQuantity && (row.maxQuantity === null || request.quantity <= row.maxQuantity)
  );
  const matches = options.filter(row => !request.finish || normalize(row.finish) === normalize(request.finish));
  if (!matches.length) return {status:"custom"};
  if (matches.length > 1) return {status:request.finish?"ambiguous":"finish"};
  const row = matches[0];
  if (!Number.isSafeInteger(row.unitPriceCents) || row.unitPriceCents <= 0 ||
    !Number.isSafeInteger(row.unitPriceCents * request.quantity)) return {status:"invalid"};
  return {status:"ok", unitPriceCents:row.unitPriceCents,totalCents:row.unitPriceCents*request.quantity,finish:row.finish,version:knowledge.tariff.version};
}
export function reply(message, previous = {}, knowledge, now = new Date(), classified = null) {
  const local = parseRequest(message, previous);
  const extracted = local.intent === "unknown" && classified && INTENTS.includes(classified.intent) ? classified : local;
  const state = {...previous};
  for (const key of ["product","size","quantity","finish"]) {
    const value = extracted[key];
    if (value !== null && value !== undefined) {
      if (key === "quantity" && (!Number.isSafeInteger(value) || value < 0 || value > 10000)) continue;
      if (key === "product" && !["fotos","ampliaciones","marcos","photobooks"].includes(value)) continue;
      if (["size","finish"].includes(key) && (typeof value !== "string" || value.length>80)) continue;
      state[key] = value;
    }
  }
  if (extracted.product && extracted.product !== previous.product) {
    if (!extracted.size) delete state.size;
    if (!extracted.finish) delete state.finish;
  }
  state.intent = extracted.intent;
  state.waitingFor = null;
  const result = (text, handoff = false) => ({text, state, handoff});
  if (extracted.intent === "human") return result("Claro. Elige tu sede y abre WhatsApp para hablar con un asesor humano. Puedes revisar y editar el resumen antes de enviarlo. El asesor responderá según la atención de la sede.", true);
  if (extracted.quantity !== null && extracted.quantity !== undefined && (!Number.isSafeInteger(extracted.quantity) || extracted.quantity < 1 || extracted.quantity > 10000)) {
    delete state.quantity;
    state.intent="quote";
    state.waitingFor="quantity";
    return result("Necesito una cantidad entera mayor a cero. Para pedidos de más de 10.000 unidades, un asesor preparará una cotización especial.",true);
  }
  if (/\bpack\b|paquete/.test(normalize(message))) return result("Las opciones por paquete necesitan confirmar qué incluyen. Un asesor revisará el paquete y la cantidad para darte el precio correcto.",true);
  if ([...normalize(message).matchAll(/\d+(?:[.,]\d+)?\s*(?:x|×|por)\s*\d+(?:[.,]\d+)?/g)].length > 1) {
    return result("Tu consulta incluye varias medidas. Para cotizar cada combinación correctamente, puedo pasar el pedido completo a un asesor. También puedes consultar una medida por vez.",true);
  }
  if (extracted.intent === "quote") {
    if (!state.product) { state.waitingFor="product"; return result("¿Qué quieres cotizar: fotos, ampliaciones, marcos o un photobook?"); }
    if (!state.size) { state.waitingFor="size"; return result("¿Qué medida necesitas? Indícala en centímetros, por ejemplo 10 x 15 cm. Para un marco, dime la medida de la foto y si quieres paspartú."); }
    if (!Number.isSafeInteger(state.quantity) || state.quantity < 1) { state.waitingFor="quantity"; return result("¿Cuántas unidades necesitas? La cantidad puede cambiar el precio por unidad."); }
    const quote = getQuote(state, knowledge, now);
    if (quote.status === "unconfirmed") return result("Ya tengo los datos de tu pedido. El tarifario oficial está en preparación, por eso no puedo confirmar un importe vigente. Puedo pasar este resumen a un asesor de tu sede para que cotice el precio unitario y por cantidad.", true);
    if (quote.status === "branch") return result("Elige tu sede en el selector de abajo para consultar la tarifa que corresponde a tu pedido.");
    if (quote.status === "finish") { state.waitingFor="finish"; return result("Hay más de un acabado para esa medida. ¿Cuál prefieres? También puedes consultar las opciones con un asesor.",true); }
    if (quote.status !== "ok") return result("Esa combinación de producto, medida, acabado y cantidad necesita una cotización del equipo. Te paso con un asesor para confirmarla.", true);
    return {...result("Cotización estimada: " + state.quantity + " unidades de " + state.size + " (" + quote.finish + "). Precio por unidad: " + money(quote.unitPriceCents) + ". Total: " + money(quote.totalCents) + ". Tarifa " + quote.version + ". El asesor confirma disponibilidad y entrega."), quote};
  }
  if (extracted.intent === "sizes") return result("En el cotizador aparecen estas medidas de foto: " + knowledge.photoSizes.join(", ") + ". Las medidas se expresan en centímetros. Para otra medida o una ampliación, dime cuál necesitas y lo revisamos con un asesor.", true);
  if (extracted.intent === "frames") return result("Para elegir un marco, primero necesitamos la medida de tu foto. La medida de la imagen, la abertura del paspartú y el tamaño exterior del marco pueden ser diferentes. Dime la medida y si quieres paspartú; un asesor confirmará materiales, colores, medidas disponibles y precio.",true);
  if (extracted.intent === "quality") return result("Comparte el archivo original cuando sea posible y evita capturas de pantalla. El encuadre puede cambiar al adaptar la imagen a otro formato. Un asesor puede revisar el archivo y acordar el recorte antes de imprimir.",true);
  if (extracted.intent === "delivery") return result("Los horarios, plazos, disponibilidad y costo de envío deben confirmarse con tu sede. Dime qué producto necesitas y para qué fecha; puedes incluirlo en el mensaje al asesor.",true);
  if (extracted.intent === "payment") return result("El asesor de tu sede confirmará los medios de pago y las condiciones del pedido. No necesitas compartir datos de tarjeta aquí.",true);
  if (extracted.intent === "branches") return result("Puedes elegir Chacarilla, Monte Grande o Chorrillos en el selector y contactar a un asesor humano por el WhatsApp oficial de esa sede.",true);
  if (extracted.intent === "greeting") return result("¡Hola! Soy el asistente virtual de DIGITAL EXPRESS. Puedo orientarte sobre medidas, preparar tu solicitud de cotización o ayudarte a hablar con una persona. ¿Qué necesitas?");
  if (previous.waitingFor === "product" && extracted.product) {
    return reply("Cotizar " + extracted.product, {...state,intent:"quote"}, knowledge, now);
  }
  return result("Puedo ayudarte con cotizaciones, medidas, marcos y preparación de archivos. Si tu consulta es más específica, un asesor humano te orientará. ¿Qué producto necesitas?",true);
}
export function handoffUrl(branch, state, messages, knowledge) {
  const number = knowledge.branches[branch];
  if (!/^51\d{9}$/.test(number || "")) return null;
  const details = [
    "Hola, sede " + branch + ". Quisiera hablar con un asesor humano.",
    state.product && "Producto: " + state.product,
    state.size && "Medida: " + state.size,
    state.quantity && "Cantidad: " + state.quantity,
    state.finish && "Acabado: " + state.finish,
    "Consultas: " + messages.filter(m=>m.role==="user").slice(-3).map((m,i,list)=>String(m.text).slice(0,i===list.length-1?600:180)).join(" / ")
  ].filter(Boolean).join("\n");
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(details);
}
