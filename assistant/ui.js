import knowledge from "./knowledge.mjs";
import {reply, parseRequest, handoffUrl, tariffIsCurrent} from "./core.mjs";

const launcher = document.querySelector("#assistant-launcher");
const panel = document.querySelector("#assistant-panel");
const log = document.querySelector("#assistant-log");
const form = document.querySelector("#assistant-form");
const input = document.querySelector("#assistant-message");
const branch = document.querySelector("#assistant-branch");
const handoff = document.querySelector("#assistant-handoff");
const handoffLink = document.querySelector("#assistant-whatsapp");
const preview = document.querySelector("#assistant-preview");
const status = document.querySelector("#assistant-status");
const send = document.querySelector("#assistant-send");
let state = {};
let messages = [];
let busy = false;
let revision = 0;
let controller;

for (const name of Object.keys(knowledge.branches)) {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  branch.append(option);
}
function append(role, text) {
  const item = document.createElement("p");
  item.className = "assistant-message assistant-" + role;
  item.textContent = text;
  log.append(item);
  messages.push({role,text});
  // Keep both the DOM and memory bounded. Nothing is persisted in the browser.
  if (messages.length > 30) { messages.shift(); log.firstElementChild.remove(); }
  item.scrollIntoView({block:"nearest"});
}
function updateHandoff() {
  const url = handoffUrl(branch.value, state, messages, knowledge);
  handoffLink.hidden = !url;
  if (!url) {
    handoffLink.removeAttribute("href");
    preview.textContent = "Elige una sede para preparar tu mensaje al asesor humano.";
    return;
  }
  handoffLink.href = url;
  handoffLink.textContent = "Abrir WhatsApp de " + branch.value;
  preview.textContent = new URL(url).searchParams.get("text");
}
function human() {
  handoff.hidden = false;
  updateHandoff();
  handoff.scrollIntoView({block:"nearest"});
  if (!branch.value) branch.focus();
}
function setBusy(value) {
  busy = value;
  send.disabled = value;
  input.disabled = value;
  status.textContent = value ? "Preparando respuesta…" : "Atención automática. Puedes hablar con una persona.";
}
async function respondTo(text) {
  text = text.trim().slice(0,600);
  if (!text || busy) return;
  const currentRevision = revision;
  append("user",text);
  state.branch = branch.value;
  const local = parseRequest(text, state);
  let answer;
  setBusy(true);
  try {
    // Frequent questions and explicit human requests are handled immediately.
    // Only ambiguous language goes to the optional server, after user disclosure.
    if (knowledge.apiEndpoint && local.intent === "unknown") {
      controller = new AbortController();
      const timer = setTimeout(()=>controller.abort(),9000);
      try {
        const response = await fetch(knowledge.apiEndpoint, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({message:text,state}),signal:controller.signal
        });
        if (!response.ok) throw new Error("Assistant unavailable");
        const data = await response.json();
        if (typeof data.text !== "string" || data.text.length>3000 || typeof data.state !== "object" || data.state===null) throw new Error("Invalid assistant response");
        answer = data;
      } catch {
        answer = reply(text,state,knowledge);
        answer.text += " La conexión conversacional no está disponible; puedes continuar con la orientación automática o un asesor.";
      } finally { clearTimeout(timer); }
    } else answer = reply(text,state,knowledge);
    if (currentRevision !== revision) return;
    state = answer.state;
    append("assistant",answer.text);
    updateHandoff();
    if (answer.handoff) human();
  } finally {
    if (currentRevision === revision) {
      setBusy(false);
      if (panel.open && !handoff.contains(document.activeElement)) input.focus();
    }
  }
}
function openAssistant() {
  if (!panel.open) panel.showModal();
  launcher.setAttribute("aria-expanded","true");
  if (!messages.length) append("assistant","¡Hola! Soy el asistente virtual de DIGITAL EXPRESS. Te ayudo con medidas y solicitudes de cotización. " + (tariffIsCurrent(knowledge.tariff) ? "Puedo calcular un estimado con el tarifario aprobado." : "Nuestro tarifario está en preparación; un asesor humano confirmará los importes."));
  document.querySelector("#assistant-privacy").textContent = knowledge.apiEndpoint ?
    "Tus consultas pueden ser procesadas por IA. No compartas datos de pago. El resumen se envía a tu sede solo cuando tú abres WhatsApp y lo envías." :
    "Esta orientación es automática. El resumen se comparte con tu sede solo cuando tú abres WhatsApp y lo envías.";
  input.focus();
}
launcher.addEventListener("click",openAssistant);
document.querySelector("#assistant-close").addEventListener("click",()=>panel.close());
panel.addEventListener("close",()=>{
  launcher.setAttribute("aria-expanded","false");
  launcher.focus();
});
document.querySelector("#assistant-human").addEventListener("click",human);
document.querySelector("#assistant-human-always").addEventListener("click",human);
document.querySelector("#assistant-reset").addEventListener("click",()=>{
  revision++;
  controller?.abort();
  state={branch:branch.value};
  messages=[];
  log.replaceChildren();
  handoff.hidden=true;
  setBusy(false);
  append("assistant","Empezamos de nuevo. ¿Qué producto o medida necesitas?");
  updateHandoff();
  input.focus();
});
branch.addEventListener("change",()=>{
  state.branch=branch.value;
  updateHandoff();
  if (state.intent === "quote" && state.product && state.size && state.quantity && !busy) respondTo("Cotizar mi pedido");
});
form.addEventListener("submit",event=>{
  event.preventDefault();
  const text=input.value;
  input.value="";
  respondTo(text);
});
document.querySelector("#assistant-shortcuts").addEventListener("click",event=>{
  const button=event.target.closest("button[data-question]");
  if (button) respondTo(button.dataset.question);
});
handoffLink.addEventListener("click",()=>{status.textContent="Se abrirá WhatsApp. Revisa el mensaje y pulsa Enviar allí para contactar a tu sede.";});
launcher.hidden=false;
