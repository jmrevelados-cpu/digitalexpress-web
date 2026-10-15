import test from "node:test";
import assert from "node:assert/strict";
import k from "./knowledge.mjs";
import {reply, getQuote, tariffIsCurrent, handoffUrl, parseRequest} from "./core.mjs";
import {classify, createAssistantServer} from "./server.mjs";

const now = new Date("2026-10-15T17:00:00Z");
const fixture = () => ({
  ...structuredClone(k),
  tariff:{
    approved:true,version:"TEST-FIXTURE",approvedBy:"Prueba automatizada",source:"Datos sintéticos de test; no son precios comerciales",
    validFrom:"2026-10-01",validUntil:"2026-10-31",
    rows:[
      {product:"fotos",size:"10 x 15 cm",finish:"Mate",branch:"Todas",minQuantity:1,maxQuantity:19,unitPriceCents:200},
      {product:"fotos",size:"10 x 15 cm",finish:"Mate",branch:"Todas",minQuantity:20,maxQuantity:49,unitPriceCents:150},
      {product:"fotos",size:"10 x 15 cm",finish:"Mate",branch:"Todas",minQuantity:50,maxQuantity:null,unitPriceCents:100}
    ]
  }
});
const request = {product:"fotos",size:"10 x 15 cm",quantity:20,finish:"Mate",branch:"Chacarilla"};

test("commercial data stays unapproved and empty until the business supplies it",()=>{
  const pending={...structuredClone(k),tariff:{...structuredClone(k.tariff),approved:false,rows:[]}};
  const answer=reply("Quiero 20 fotos de 10x15",{},pending,now);
  assert.match(answer.text,/tarifario oficial está en preparación/);
  assert.ok(answer.handoff);
  assert.doesNotMatch(answer.text,/S\//);
});
test("quantity bands apply a final unit rate to the entire order, with no stacked discount",()=>{
  const data=fixture();
  for(const [quantity,unit,total] of [[1,200,200],[19,200,3800],[20,150,3000],[49,150,7350],[50,100,5000],[100,100,10000]]) {
    const quote=getQuote({...request,quantity},data,now);
    assert.equal(quote.unitPriceCents,unit);
    assert.equal(quote.totalCents,total);
  }
});
test("no outdated, unapproved, ambiguous, invalid or foreign-branch prices",()=>{
  const data=fixture();
  assert.equal(tariffIsCurrent(data.tariff,new Date("2026-11-01T06:00:00Z")),false);
  assert.equal(tariffIsCurrent({...data.tariff,validFrom:"2026-02-30"},now),false);
  assert.equal(getQuote({...request,branch:"inventada"},data,now).status,"branch");
  assert.equal(getQuote({...request,quantity:1.5},data,now).status,"quantity");
  data.tariff.rows.push({...data.tariff.rows[1]});
  assert.equal(getQuote(request,data,now).status,"ambiguous");
  data.tariff.rows.pop();
  data.tariff.rows[1].unitPriceCents=-1;
  assert.equal(getQuote(request,data,now).status,"invalid");
});
test("slot collection, followups, multi-size requests and human requests",()=>{
  let response=reply("Quiero cotizar fotos",{},k,now);
  assert.equal(response.state.waitingFor,"size");
  response=reply("10x15",response.state,k,now);
  assert.equal(response.state.waitingFor,"quantity");
  response=reply("20",response.state,k,now);
  assert.equal(response.state.quantity,20);
  assert.ok(response.handoff);
  response=reply("y 50",response.state,k,now);
  assert.equal(response.state.quantity,50);
  assert.ok(reply("20 fotos 10x15 y 20 fotos 20x30",{},fixture(),now).handoff);
  assert.equal(reply("Quiero un asesor humano",response.state,k,now).state.intent,"human");
  assert.match(reply("medidas de marcos",{},k,now).text,/exterior/);
  for(const amount of ["-20","1.5","10001"]) {
    const answer=reply("Quiero "+amount+" fotos de 10x15",request,fixture(),now);
    assert.equal(answer.quote,undefined);
    assert.equal(answer.state.quantity,undefined);
  }
  assert.ok(reply("Precio por paquete de 20 fotos 10x15",{},fixture(),now).handoff);
});
test("prices and URLs from model/user content never become business facts",()=>{
  const answer=reply("palabras ambiguas",{},k,now,{intent:"quote",product:"fotos",size:"10 x 15 cm",quantity:20,finish:"Mate",price:0,url:"https://bad.example"});
  assert.ok(answer.handoff);
  assert.doesNotMatch(answer.text,/bad.example|S\//);
  for(const [branch,number] of Object.entries(k.branches)) {
    const url=new URL(handoffUrl(branch,request,[{role:"user",text:"Necesito acabado mate"}],k));
    assert.equal(url.pathname,"/"+number);
    assert.match(url.searchParams.get("text"),/asesor humano/);
  }
  assert.equal(handoffUrl("Inventada",request,[],k),null);
  assert.equal(parseRequest("foto 4x6 pulgadas").size,"4 x 6 pulgadas");
});
test("Responses integration extracts structured fields, without sending a price list",async()=>{
  let payload;
  const result=await classify("Necesito sacar veinte copias pequeñas",{}, {OPENAI_API_KEY:"test-only",OPENAI_MODEL:"configured-test-model"},async(url,options)=>{
    assert.equal(url,"https://api.openai.com/v1/responses");
    payload=JSON.parse(options.body);
    return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:JSON.stringify({intent:"quote",product:"fotos",size:null,quantity:20,finish:null})}]}]});
  });
  assert.equal(result.quantity,20);
  assert.equal(payload.store,false);
  assert.equal(payload.text.format.strict,true);
  assert.equal(await classify("consulta",{},{}),null);
});
test("server validates origin/body, serves only public files and recovers from provider failure",async()=>{
  const server=createAssistantServer({env:{ALLOWED_ORIGIN:"https://shop.example",OPENAI_API_KEY:"test-only",OPENAI_MODEL:"test"},fetcher:async()=>{throw new Error("offline");},now:()=>now});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  try {
    const headers={Origin:"https://shop.example","Content-Type":"application/json"};
    let response=await fetch(base+"/api/assistant",{method:"POST",headers,body:JSON.stringify({message:"Quiero 20 fotos 10x15",state:{branch:"Chacarilla"}})});
    assert.equal(response.status,200);
    const data=await response.json();
    assert.equal(data.mode,"guided");
    assert.ok(data.handoff);
    assert.equal((await fetch(base+"/assistant/server.mjs")).status,404);
    assert.equal((await fetch(base+"/assistant/knowledge.mjs")).status,200);
    assert.equal((await fetch(base+"/api/assistant",{method:"POST",headers:{...headers,Origin:"https://evil.example"},body:"{}"})).status,403);
    assert.equal((await fetch(base+"/api/assistant",{method:"POST",headers,body:JSON.stringify({message:"x".repeat(601)})})).status,400);
    response=await fetch(base+"/api/assistant",{method:"POST",headers,body:JSON.stringify({message:"consulta inusual"})});
    assert.equal((await response.json()).mode,"guided");
  } finally {await new Promise(resolve=>server.close(resolve));}
});
