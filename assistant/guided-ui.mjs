import {catalog,faqs,sizes,guidedQuote,guidedHandoff} from "./guided.mjs";

export function mountGuidedAssistant({panel,branch,launcher}) {
  const shortcuts=panel.querySelector("#assistant-shortcuts");
  if (!shortcuts || !branch || !launcher) return;
  const section=document.createElement("section");
  section.className="guided-flow";
  section.setAttribute("aria-label","Asistente comercial guiado");
  shortcuts.before(section);
  const chatLog=panel.querySelector("#assistant-log");
  const composer=panel.querySelector("#assistant-form");
  const modeBar=document.createElement("div");
  modeBar.className="assistant-modes";
  modeBar.setAttribute("role","group");
  modeBar.setAttribute("aria-label","Modo de atención de Chispa");
  const guidedTab=document.createElement("button");
  guidedTab.type="button";
  guidedTab.textContent="Elegir productos";
  const chatTab=document.createElement("button");
  chatTab.type="button";
  chatTab.textContent="Escribir consulta";
  modeBar.append(guidedTab,chatTab);
  section.before(modeBar);
  function setMode(mode) {
    const guided=mode==="guided";
    section.hidden=!guided;
    if(chatLog) chatLog.hidden=guided;
    shortcuts.hidden=guided;
    if(composer) composer.hidden=guided;
    guidedTab.setAttribute("aria-pressed",String(guided));
    chatTab.setAttribute("aria-pressed",String(!guided));
  }
  guidedTab.addEventListener("click",()=>setMode("guided"));
  chatTab.addEventListener("click",()=>setMode("chat"));
  setMode("guided");
  const state={product:"",size:"",quantity:"",delivery:"pickup",notes:""};
  let stage="catalog";
  function el(tag,txt,cls) {
    const node=document.createElement(tag);
    if (txt!==undefined) node.textContent=txt;
    if(cls) node.className=cls;
    return node;
  }
  function button(label,fn) {
    const b=el("button",label);
    b.type="button"; b.addEventListener("click",fn);return b;
  }
  function field(label,control) {
    const wrap=el("label",label,"guided-field");
    wrap.append(control);return wrap;
  }
  function select(options,value,update) {
    const node=el("select");
    for (const [val,label] of options) {
      const option=el("option",label);option.value=val;node.append(option);
    }
    node.value=value;node.addEventListener("change",()=>update(node.value));return node;
  }
  function reset(){Object.assign(state,{product:"",size:"",quantity:"",delivery:"pickup",notes:""});stage="catalog";render();}
  function render(){
    section.replaceChildren();
    section.append(el("h3","Chispa te ayuda a elegir"));
    if(stage==="catalog"){
      section.append(el("p","Elige el producto que deseas cotizar."));
      const grid=el("div",undefined,"guided-catalog");
      for(const item of catalog){
        const b=button(item.label,()=>{state.product=item.id;stage="details";render();});
        b.className="guided-product";
        const img=el("img");img.src="assets/productos/"+item.image;img.alt="";img.loading="lazy";img.width=72;img.height=60;
        b.prepend(img);grid.append(b);
      }
      section.append(grid);
      section.append(button("Preguntas frecuentes",()=>{stage="faq";render();}));
      return;
    }
    if(stage==="faq"){
      for(const faq of faqs){
        const details=el("details");details.append(el("summary",faq.question),el("p",faq.answer));section.append(details);
      }
      section.append(button("Volver al catálogo",reset));return;
    }
    const item=catalog.find(x=>x.id===state.product);
    if(!item){reset();return;}
    section.append(el("p","Producto: "+item.label));
    if(stage==="details"){
      section.append(field("Medida",select([["","Seleccionar medida"],...sizes.map(x=>[x,x]),["otra","Otra / consultar"]],state.size,v=>state.size=v)));
      const qty=el("input");qty.type="number";qty.min="1";qty.max="10000";qty.step="1";qty.value=state.quantity;qty.placeholder="Cantidad";qty.addEventListener("input",()=>state.quantity=qty.value);
      section.append(field("Cantidad",qty));
      section.append(button("Continuar",()=>{
        if(!Number.isSafeInteger(Number(state.quantity))||Number(state.quantity)<1||Number(state.quantity)>10000){qty.setCustomValidity("Ingresa una cantidad entera de 1 a 10000");qty.reportValidity();qty.setCustomValidity("");return;}
        stage="delivery";render();
      }));
      section.append(button("Cambiar producto",reset));return;
    }
    if(stage==="delivery"){
      section.append(field("Entrega",select([["pickup","Recojo en tienda"],["delivery","Delivery (por confirmar)"]],state.delivery,v=>state.delivery=v)));
      const notes=el("textarea");notes.maxLength=250;notes.rows=2;notes.placeholder="Color, acabado, fecha u observaciones (opcional)";notes.value=state.notes;notes.addEventListener("input",()=>state.notes=notes.value);
      section.append(field("Observaciones",notes));
      section.append(el("p","Selecciona tu sede en el selector del asistente para preparar el WhatsApp."));
      section.append(button("Ver resumen",()=>{stage="summary";render();}));
      section.append(button("Atrás",()=>{stage="details";render();}));return;
    }
    const result=guidedQuote({...state,branch:branch.value});
    section.append(el("p","Sede: "+(branch.value||"Pendiente")+" · "+state.quantity+" unidad(es) · "+(state.size||"Medida por confirmar")));
    if(result.status==="ok"){
      section.append(el("strong","Estimado: S/ "+(result.totalCents/100).toFixed(2)+" (S/ "+(result.unitPriceCents/100).toFixed(2)+" por unidad)"));
      section.append(el("p","Acabado, disponibilidad y entrega sujetos a confirmación."));
    }else section.append(el("p","Precio por confirmar con un asesor. No se aplican promociones automáticas."));
    const url=guidedHandoff({...state,branch:branch.value});
    if(url){
      const a=el("a","Abrir WhatsApp de "+branch.value,"guided-whatsapp");a.href=url;a.target="_blank";a.rel="noopener noreferrer";section.append(a);
    }else section.append(el("p","Elige una sede para habilitar el enlace de WhatsApp."));
    section.append(button("Modificar datos",()=>{stage="details";render();}));
    section.append(button("Nuevo pedido",reset));
  }
  branch.addEventListener("change",()=>{if(stage==="summary")render();});
  panel.querySelector("#assistant-reset")?.addEventListener("click",reset);
  render();
}
