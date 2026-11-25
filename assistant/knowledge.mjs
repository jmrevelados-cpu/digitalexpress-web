import source from "../tarifario/precios-foto-2026-10-15.mjs";

const sizeLabel = value => value.split("x").join(" x ") + " cm";
const rows=[];
const add = (product,size,min,max,price,id) => {
  const row={product,size:sizeLabel(size),finish:"Acabado por confirmar",branch:"Todas",minQuantity:min,maxQuantity:max,unitPriceCents:price,sourceRow:id};
  if(!rows.some(r=>r.product===row.product&&r.size===row.size&&r.minQuantity===min&&r.maxQuantity===max&&r.unitPriceCents===price)) rows.push(row);
};
for(const product of ["fotos","ampliaciones"]) {
  for(const rate of source.basePrices) add(product,rate.size,1,1,rate.priceCents,rate.id);
  for(const group of source.quantityGroups) for(const size of group.sizes) for(const rate of group.rows) add(product,size,rate.min,rate.max,rate.priceCents,rate.id);
}
export default {
  brand:"DIGITAL EXPRESS",
  apiEndpoint:"",
  branches:{PRIMAVERA:"51968241599","Monte Grande":"51968229804",Chorrillos:"51962292116"},
  photoSizes:["5 x 7 cm",...source.basePrices.map(row=>sizeLabel(row.size))],
  commonPhotoSizes:["5 x 7 cm","10 x 15 cm","13 x 18 cm","15 x 15 cm","15 x 20 cm","20 x 25 cm","20 x 30 cm"],
  tariff:{
    approved:source.unitBasis.confirmed,
    version:source.version,
    approvedBy:source.unitBasis.confirmedBy,
    source:source.source.filename,
    validFrom:source.receivedOn,
    validUntil:null, // No expiry date is printed in the source.
    confirmedOn:source.unitBasis.confirmedOn,
    rows,
    pending:source.pending,
    promotions:source.promotions
  }
};
