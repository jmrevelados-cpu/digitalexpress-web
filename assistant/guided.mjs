// Flujo comercial determinista. Sin API, sin almacenamiento de datos personales.
import {getQuote, handoffUrl} from "./core.mjs";
import knowledge from "./knowledge.mjs";

export const catalog = [
  {id:"fotos",label:"Impresión de fotos",image:"fotos.webp",quoted:true},
  {id:"ampliaciones",label:"Ampliaciones",image:"revelado.webp",quoted:true},
  {id:"marcos",label:"Marcos y cuadros",image:"cuadros.webp",quoted:false},
  {id:"photobooks",label:"Álbumes y fotolibros",image:"photobooks.webp",quoted:false},
  {id:"personalizados",label:"Tazas y personalizados",image:"gifts.webp",quoted:false},
  {id:"calendarios",label:"Calendarios",image:"calendarios.webp",quoted:false},
  {id:"tarjetas",label:"Tarjetas",image:"tarjetas.webp",quoted:false},
  {id:"accesorios",label:"Llaveros y accesorios",image:"accesorios.webp",quoted:false}
];
export const faqs = [
  {question:"¿Qué medidas imprimen?",answer:"Tenemos distintas medidas de fotografía y ampliaciones. Selecciona una medida en el cotizador; las especiales se consultan con un asesor."},
  {question:"¿Qué archivo debo enviar?",answer:"Envía la foto original en la mejor resolución posible. Evita capturas de pantalla; el asesor confirmará recortes."},
  {question:"¿Puedo elegir mate o brillo?",answer:"Consulta el acabado disponible con tu sede. El tarifario no distingue precios confirmados por acabado."},
  {question:"¿Hacen delivery?",answer:"Puedes solicitar delivery o recojo. La sede confirmará cobertura, costo y plazo antes del pedido."},
  {question:"¿Qué medios de pago aceptan?",answer:"Consulta los medios de pago con tu sede. No ingreses datos bancarios en este asistente."},
  {question:"¿Cómo aplican las promociones?",answer:"Las promociones requieren confirmación de condiciones y vigencia por un asesor; no se acumulan automáticamente."},
  {question:"¿Dónde están las sedes?",answer:"Selecciona Chacarilla, Monte Grande o Chorrillos y contacta por su WhatsApp oficial."}
];
export const sizes = ["5 x 7 cm","10 x 15 cm","13 x 18 cm","15 x 20 cm","20 x 25 cm","20 x 30 cm"];
export function guidedQuote({product,size,quantity,branch}) {
  const item=catalog.find(p=>p.id===product);
  if (!item || !item.quoted) return {status:"advisor"};
  return getQuote({product,size,quantity:Number(quantity),branch},knowledge);
}
export function guidedHandoff({product,size,quantity,branch,delivery,notes}) {
  const item=catalog.find(p=>p.id===product);
  if (!item || !Object.hasOwn(knowledge.branches,branch)) return null;
  const safeNotes=String(notes||"").slice(0,250).replace(/[\r\n]+/g," ");
  const messages=[{role:"user",text:"Entrega: "+(delivery==="delivery"?"Delivery (costo por confirmar)":"Recojo en tienda")+(safeNotes?". Observaciones: "+safeNotes:"")}];
  const url=handoffUrl(branch,{product:item.label,size:size||"Medida por confirmar",quantity:Number(quantity)||undefined},messages,knowledge);
  return url;
}
