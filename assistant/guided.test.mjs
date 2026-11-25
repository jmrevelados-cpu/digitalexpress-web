import test from "node:test";
import assert from "node:assert/strict";
import {catalog,faqs,guidedQuote,guidedHandoff} from "./guided.mjs";

test("catalog has unique products and local images",()=>{
  assert.equal(catalog.length,8);
  assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length);
  for(const item of catalog) assert.match(item.image,/^[a-z-]+\.webp$/);
});
test("FAQ answers never promise unconfirmed payment, promotions or delivery",()=>{
  assert.ok(faqs.length>=7);
  assert.ok(faqs.some(x=>/promociones/.test(x.question.toLowerCase())));
});
test("10x15 quantity tiers use approved prices only",()=>{
  const q=guidedQuote({product:"fotos",size:"10 x 15 cm",quantity:20,branch:"Chacarilla"});
  assert.equal(q.status,"ok");
  assert.equal(q.totalCents,6000);
  assert.equal(guidedQuote({product:"fotos",size:"10 x 15 cm",quantity:1000,branch:"Chacarilla"}).status,"ambiguous");
  assert.notEqual(guidedQuote({product:"marcos",size:"10 x 15 cm",quantity:1,branch:"Chacarilla"}).status,"ok");
  assert.notEqual(guidedQuote({product:"fotos",size:"otra",quantity:1,branch:"Chacarilla"}).status,"ok");
});
test("handoff respects all three official branch WhatsApp numbers",()=>{
  for(const [branch,number] of Object.entries({Chacarilla:"51968241599","Monte Grande":"51968229804",Chorrillos:"51962292116"})){
    const url=guidedHandoff({product:"fotos",size:"10 x 15 cm",quantity:20,branch,delivery:"delivery",notes:"Mate"});
    assert.equal(new URL(url).pathname,"/"+number);
    assert.match(new URL(url).searchParams.get("text"),/Delivery/);
    assert.match(new URL(url).searchParams.get("text"),/Mate/);
  }
  assert.equal(guidedHandoff({product:"fotos",branch:"Inexistente"}),null);
  assert.equal(guidedHandoff({product:"inexistente",branch:"Chacarilla"}),null);
});
