// Calculation rules and arithmetic from Pack Legacy's dimensional weight calculator.
const calculateShipment = (() => {
  const round = (n, digits=0) => Math.sign(n) * Math.round(Math.abs(n) * 10**digits + 1e-9) / 10**digits;
  const up = (n, step=1) => Math.max(n>0 ? step : 0, Math.ceil(n/step-1e-9)*step);
  const A={O:round, W:up, S:n=>up(n), N:(n,step)=>Math.floor(n/step+1e-9)*step, l:(n,digits=2)=>round(n,digits).toLocaleString('en-US',{maximumFractionDigits:digits})};
  const sorted = sizes => [...sizes].sort((a,b)=>b-a);
  const _={v: sorted, u:sizes=>{const [l,w,h]=sorted(sizes);return l+2*w+2*h;}};
  const y={H:2.54, N:1728, U:kg=>kg/0.45359237, d:lb=>lb*0.45359237};
  const w={V:(level,code,message)=>({level,code,message}),H:(id,rule)=>({id,source:rule.source}),X:(value,explain,flags,rules)=>({value,explain,flags,rules})};
const v={version:"2026-11-17",note:"Seed values from the build plan (sections 7.2 and 12.1). Each carrier stays verifiedOn=null until checked against the carrier page in the tool 1 spec (verification register items 1-3).",carriers:{ups:{id:"ups",name:"UPS",dimDivisorIn:139,dimDivisorCm:5e3,dimRounding:"ceil-each-side-to-whole-unit",dimRoundingSince:"2025-08-18",weightRounding:"ceil-lb",metricWeightStepKg:1,dimAppliesAboveIn3:0,surcharges:{additionalHandling:{longestGt:48,secondGt:30,lengthGirthGt:105,weightGtLb:50,volumeGtIn3:10368,suppressedByLargePackage:!0,label:"Additional Handling"},largePackage:{longestGt:96,lengthGirthGt:130,volumeGtIn3:17280,weightGtLb:110,minBillableLb:90,label:"Large Package Surcharge"},overMax:{longestGt:108,lengthGirthGt:165,weightGtLb:150}},source:"UPS: checking shipment size and weight",sourceUrl:"https://filexfer.ups.com/us/en/support/shipping-support/shipping-dimensions-weight",effectiveFrom:"2026-01-26",verifiedOn:null,secondarySources:["https://sifted.com/resources/2025-2026-fedex-ups-changes-how-dim-rounding-and-cubic-volume-rules-will-impact-your-costs/","https://www.loop.com/industry-insights/2026-parcel-surcharge-changes-what-shippers-need-to-know-about-new-cubic-volume-rules","https://filexfer.ups.com/it/en/support/shipping-support/shipping-dimensions-weight"],contractDivisorAllowed:!0,minBillableLb:1,minBillableKg:1,metricNote:"cm/kg: 5,000 cm³ per kg, fractions rounded up to the next whole kg (UPS dimensions and weight guide, metric version)."},fedex:{id:"fedex",name:"FedEx",dimDivisorIn:139,dimDivisorCm:5e3,dimRounding:"ceil-each-side-to-whole-unit",dimRoundingSince:"2025-08-18",weightRounding:"ceil-lb",metricWeightStepKg:1,dimAppliesAboveIn3:0,surcharges:{additionalHandling:{longestGt:48,secondGt:30,lengthGirthGt:105,weightGtLb:50,volumeGtIn3:10368,suppressedByLargePackage:!0,label:"Additional Handling Surcharge"},largePackage:{longestGt:96,lengthGirthGt:130,volumeGtIn3:17280,weightGtLb:110,minBillableLb:90,label:"Oversize Charge"},overMax:{longestGt:108,lengthGirthGt:165,weightGtLb:150}},source:"FedEx: how to calculate dimensional weight",sourceUrl:"https://www.fedex.com/en-my/customer-support/faq/invoices-and-payments/fees-and-charges/calculate-dimensional-weight.html",effectiveFrom:"2026-01-12",verifiedOn:null,secondarySources:["https://sifted.com/resources/2025-2026-fedex-ups-changes-how-dim-rounding-and-cubic-volume-rules-will-impact-your-costs/","https://www.loop.com/industry-insights/2026-parcel-surcharge-changes-what-shippers-need-to-know-about-new-cubic-volume-rules"],contractDivisorAllowed:!0,minBillableLb:1,minBillableKg:1,metricNote:"cm/kg: 5,000 cm³ per kg; whole-kg rounding assumed to match UPS (not yet confirmed on fedex.com)."},usps:{id:"usps",name:"USPS",dimDivisorIn:139,dimDivisorCm:null,previousDimDivisorIn:166,dimRounding:"ceil-each-side-to-whole-unit",dimRoundingSince:"2026-07-12",weightRounding:"ceil-lb",metricWeightStepKg:null,dimAppliesAboveIn3:1728,limits:{maxWeightLb:70,oversizedLengthGirthGt:108,maxLengthGirth:130},surcharges:{},source:"USPS Domestic Mail Manual 223 (Priority Mail) 1.4 and 283 (Ground Advantage) 1.4",sourceUrl:"https://pe.usps.com/text/dmm300/223.htm",effectiveFrom:"2026-07-12",verifiedOn:"2026-11-12",nonstandard:{lengthGtIn:[22,30],volumeGtIn3:3456},nonrectangular:{factor:.785,priorityMail:{divisor:166,sideRounding:"round-nearest"},groundAdvantage:{divisor:139,sideRounding:"ceil"}},openItems:["Priority Mail 130 in L+G maximum seen only in Notice 123 quick reference"],contractDivisorAllowed:!1,minBillableLb:1},dhl:{id:"dhl",name:"DHL Express",dimDivisorCm:5e3,dimRounding:"ceil-each-side-to-whole-unit",weightRounding:"ceil-step",metricWeightStepKg:.5,dimAppliesAboveIn3:0,surcharges:{},source:"DHL: volumetric weight",sourceUrl:"https://dct.dhl.com/help",effectiveFrom:"2026-01-01",verifiedOn:null,contractDivisorAllowed:!1,minBillableKg:.5,note:"DHL Express publishes 139 for in/lb and 5,000 for cm/kg. kg weights round up to the next 0.5 kg; lb weights round up to the next whole lb (lb rounding unconfirmed).",dimDivisorIn:139,minBillableLb:1,secondarySources:["https://www.dhl.com/discover/en-us/ship-with-dhl/services/get-a-rate-quote-and-transit-time"],pieceLimits:{maxCm:[120,80,80],maxKg:70,label:"DHL Express piece limit",source:"DHL Express: weights and sizes 2026 (Netherlands, English)",sourceUrl:"https://www.dhlexpress.nl/sites/default/files/content/DHL%20Express%20Weights%20%26%20Sizes_NL_ENG_V2_2026.pdf",effectiveFrom:"2026-01-01",verifiedOn:null},oversizePiece:{longestGtCm:100,secondGtCm:80,label:"Oversize Piece",source:"DHL Express: surcharges (Oversize Piece)",sourceUrl:"https://www.dhl.com/ph-en/home/express/products-and-solutions/products-and-services-overview/surcharges.html",effectiveFrom:"2026-01-01",verifiedOn:null}}}};
const x={version:"2026-11-12",note:"Verified against the DMM on 2026-11-12 (paragraphs tagged [7-12-26]).",cubic:{measuring:{truncateEachSideToIn:.25,tierStepFt3:.1},groundAdvantageCubic:{maxFt3:1,maxWeightLb:20,maxLongestIn:22},priorityMailCubic:{maxFt3:.5,maxWeightLb:20,maxLongestIn:22},excludedPackaging:["tube"],softpackTiers:[{tierFt3:.1,maxLengthPlusWidthIn:21},{tierFt3:.2,maxLengthPlusWidthIn:27},{tierFt3:.3,maxLengthPlusWidthIn:31},{tierFt3:.4,maxLengthPlusWidthIn:34},{tierFt3:.5,maxLengthPlusWidthIn:36}],source:"USPS Domestic Mail Manual 223 1.3 and 283 1.3 (cubic pricing)",sourceUrl:"https://pe.usps.com/text/dmm300/283.htm",effectiveFrom:"2026-07-12",verifiedOn:"2026-11-12"}};
let k={carriers:v,cubic:x},B=(e,t=2)=>(0,A.l)(e,t),C=(e,t,r=3)=>`${e.map(e=>B(e,r)).join(" x ")} ${t}`,M=e=>"softpack"===e||"mylar"===e;function I(e,t){let r,a=(r=[e.l,e.w,e.h],"in"===e.unit?{in:r,cm:r.map(e=>e*y.H),lb:e.weight,kg:(0,y.d)(e.weight)}:{in:r.map(e=>e/y.H),cm:r,lb:(0,y.U)(e.weight),kg:e.weight}),n={},o=[];for(let r of e.carriers){let i=function(e,t,r,a){let n=[],o=[],i=r.name,s="cm"===e.unit&&!!r.dimDivisorCm,c=s?"cm":"in",l=s?"kg":"lb",d=s?t.cm:t.in,u="tube"===e.packaging,p="usps"===r.id,f=e=>(0,_.v)("ceil-each-side-to-whole-unit"===r.dimRounding?e.map(A.S):e),h=f(d);n.push({text:`${i}: sides rounded up to whole ${"in"===c?"inches":"cm"}: ${C((0,_.v)(d),c)} → ${C(h,c)}`,ruleRef:`${r.id}.dimRounding`});let m=s?f(t.in):h,g=m[0]*m[1]*m[2],b=h[0]*h[1]*h[2],v=p&&u?r.nonrectangular:void 0,x=v?b*v.factor:b;n.push({text:v?`${i}: nonrectangular volume ${C(h,c)} x ${v.factor} = ${B(x)} ${c}\xb3`:`${i}: volume ${C(h,c)} = ${B(x,0)} ${c}\xb3`,ruleRef:v?"usps.nonrectangular":void 0});let k=s?r.dimDivisorCm:v?v.groundAdvantage.divisor:r.dimDivisorIn;if(!k)throw Error(`${r.id}: no divisor for ${c}`);let I=void 0!==e.contractDivisor&&r.contractDivisorAllowed&&!s,E=I?e.contractDivisor:k;I&&o.push((0,w.V)("info","CONTRACT_DIVISOR",`${i}: using your contract divisor ${E} instead of ${k}.`));let S=(s?g:x)>r.dimAppliesAboveIn3;S||(n.push({text:`${i}: ${B(x,0)} in\xb3 is not more than ${B(r.dimAppliesAboveIn3,0)} in\xb3 (1 cu ft), so dimensional weight does not apply`,ruleRef:`${r.id}.dimAppliesAboveIn3`}),o.push((0,w.V)("info","USPS_DIM_NOT_APPLIED",`${i}: 1 cu ft or smaller, billed on actual weight.`)));let N=s?r.metricWeightStepKg??1:1,z=null;S&&(z=(0,A.W)(x/E,N),n.push({text:`${i}: DIM weight ${B(x,0)} / ${B(E,0)} = ${B(x/E,2)} → rounded up to ${B(z)} ${l}`,formula:`L x W x H / ${B(E,0)}`,ruleRef:`${r.id}.${s?"dimDivisorCm":"dimDivisorIn"}`}));let j=s?t.kg:t.lb,F=s?r.minBillableKg??0:r.minBillableLb??0,P=Math.max((0,A.W)(j,N),F);n.push({text:`${i}: actual weight ${B(j)} ${l} → ${B(P)} ${l}${j<F?" (minimum billable)":""}`,ruleRef:`${r.id}.weightRounding`});let R=Math.max(z??0,P);n.push({text:null===z?`${i}: billable = actual = ${B(R)} ${l}`:`${i}: billable = greater of ${B(z)} and ${B(P)} = ${B(R)} ${l}`});let D=(0,_.u)(h),T=(0,_.u)(m),U=[],Q=t.lb,q=r.surcharges;if(q.overMax&&(m[0]>q.overMax.longestGt||T>q.overMax.lengthGirthGt||Q>q.overMax.weightGtLb))o.push((0,w.V)("error","OVER_MAX",`${i}: over the maximum (longest ${q.overMax.longestGt} in, length + girth ${q.overMax.lengthGirthGt} in, ${q.overMax.weightGtLb} lb). Not accepted as a parcel.`)),R=null;else{let e=q.largePackage,t=!1;if(e){let a=[m[0]>e.longestGt&&`longest side ${m[0]} in > ${e.longestGt}`,T>e.lengthGirthGt&&`length + girth ${T} in > ${e.lengthGirthGt}`,g>e.volumeGtIn3&&`volume ${B(g,0)} in\xb3 > ${B(e.volumeGtIn3,0)}`,Q>e.weightGtLb&&`weight ${B(Q)} lb > ${e.weightGtLb}`].filter(e=>!!e);if(a.length){t=!0,U.push({code:"LARGE_PACKAGE",label:e.label,reasons:a}),o.push((0,w.V)("warn","LARGE_PACKAGE",`${i}: ${e.label} (${a.join("; ")}).`));let c=s?(0,A.W)((0,y.d)(e.minBillableLb),N):e.minBillableLb;R<c&&(n.push({text:`${i}: ${e.label} minimum billable ${B(c)} ${l}${s?` (${e.minBillableLb} lb)`:""} replaces ${B(R)} ${l}`,ruleRef:`${r.id}.surcharges.largePackage.minBillableLb`}),o.push((0,w.V)("warn","LARGE_PACKAGE_MIN_APPLIED",`${i}: billed at least ${B(c)} ${l}.`)),R=c)}}let a=q.additionalHandling;if(a){let r=[m[0]>a.longestGt&&`longest side ${m[0]} in > ${a.longestGt}`,m[1]>a.secondGt&&`second-longest side ${m[1]} in > ${a.secondGt}`,T>a.lengthGirthGt&&`length + girth ${T} in > ${a.lengthGirthGt}`,Q>a.weightGtLb&&`weight ${B(Q)} lb > ${a.weightGtLb}`,g>a.volumeGtIn3&&`volume ${B(g,0)} in\xb3 > ${B(a.volumeGtIn3,0)}`].filter(e=>!!e);r.length&&t&&a.suppressedByLargePackage?n.push({text:`${i}: ${a.label} is not added on top of ${e?.label}`}):r.length&&(U.push({code:"ADDITIONAL_HANDLING",label:a.label,reasons:r}),o.push((0,w.V)("warn","ADDITIONAL_HANDLING",`${i}: ${a.label} (${r.join("; ")}).`)))}}if(r.pieceLimits||r.oversizePiece){let e=f(t.cm),a=r.pieceLimits;if(a&&(e[0]>a.maxCm[0]||e[1]>a.maxCm[1]||e[2]>a.maxCm[2]||t.kg>a.maxKg))o.push((0,w.V)("error","DHL_OVER_PIECE_LIMIT",`${i}: over the ${a.maxCm.join(" x ")} cm / ${a.maxKg} kg piece limit (this piece: ${C(e,"cm",0)}, ${B(t.kg)} kg). Not accepted as a standard express piece.`)),R=null;else if(r.oversizePiece&&(e[0]>r.oversizePiece.longestGtCm||e[1]>r.oversizePiece.secondGtCm)){let t=r.oversizePiece,a=[e[0]>t.longestGtCm&&`longest side ${e[0]} cm > ${t.longestGtCm}`,e[1]>t.secondGtCm&&`second-longest side ${e[1]} cm > ${t.secondGtCm}`].filter(e=>!!e);U.push({code:"DHL_OVERSIZE_PIECE",label:t.label,reasons:a}),o.push((0,w.V)("warn","DHL_OVERSIZE_PIECE",`${i}: ${t.label} (${a.join("; ")}).`))}}if(p&&r.limits){Q>r.limits.maxWeightLb||T>r.limits.maxLengthGirth?(o.push((0,w.V)("error","USPS_OVER_MAX",`${i}: over ${r.limits.maxWeightLb} lb or ${r.limits.maxLengthGirth} in length + girth. Not mailable.`)),R=null):T>r.limits.oversizedLengthGirthGt&&o.push((0,w.V)("warn","USPS_OVERSIZED_TIER",`${i}: length + girth ${T} in is over ${r.limits.oversizedLengthGirthGt} in, so Ground Advantage charges its oversized price.`));let e=r.nonstandard;if(e&&null!==R){let t=[...e.lengthGtIn].sort((e,t)=>t-e).find(e=>m[0]>e);void 0!==t&&o.push((0,w.V)("warn",`USPS_NONSTANDARD_${t}`,`${i}: longest side over ${t} in adds a nonstandard fee.`)),g>e.volumeGtIn3&&o.push((0,w.V)("warn","USPS_NONSTANDARD_VOLUME",`${i}: over 2 cu ft (${B(e.volumeGtIn3,0)} in\xb3) adds a nonstandard fee.`))}if(v&&null!==R){let e=(0,_.v)(t.in.map(e=>Math.round(e))).reduce((e,t)=>e*t,1)*v.factor,a=e>r.dimAppliesAboveIn3?Math.max((0,A.W)(e/v.priorityMail.divisor),P):P;o.push((0,w.V)("info","USPS_PRIORITY_NONRECT",`${i}: figures shown are Ground Advantage. Priority Mail uses a different tube rule: ${a} lb.`))}}let O=p&&null!==R?function(e,t,r,a,n){let o=(e,t=null)=>({eligible:!1,measured:t,measure:M(r)?"length-plus-width-in":"ft3",tierFt3:null,priorityMail:!1,groundAdvantage:!1,reason:e});if(a.excludedPackaging.includes(r))return o("Rolls and tubes do not qualify for cubic pricing.");let i=Math.max(a.priorityMailCubic.maxWeightLb,a.groundAdvantageCubic.maxWeightLb);if(t>i)return o(`Cubic pricing is limited to ${i} lb.`);let s=a.measuring.truncateEachSideToIn,c=(0,_.v)(e).map(e=>(0,A.N)(e,s));if(M(r)){let e=c[0]+c[1];n.push({text:`USPS cubic (softpack): length + width rounded down to 1/4 in: ${B(c[0])} + ${B(c[1])} = ${B(e)} in`,ruleRef:"usps-cubic.softpackTiers"});let t=a.softpackTiers.find(t=>e<=t.maxLengthPlusWidthIn);return t?{eligible:!0,measured:e,measure:"length-plus-width-in",tierFt3:t.tierFt3,priorityMail:t.tierFt3<=a.priorityMailCubic.maxFt3,groundAdvantage:t.tierFt3<=a.groundAdvantageCubic.maxFt3,reason:null}:o(`Softpack length + width over ${a.softpackTiers.at(-1)?.maxLengthPlusWidthIn} in.`,e)}let l=c[0]*c[1]*c[2]/y.N,d=Math.max(a.priorityMailCubic.maxLongestIn,a.groundAdvantageCubic.maxLongestIn);if(c[0]>d)return o(`Longest side over ${d} in.`,l);let u=(0,A.O)(Math.max(a.measuring.tierStepFt3,(0,A.W)(l,a.measuring.tierStepFt3)),2);n.push({text:`USPS cubic: sides rounded down to 1/4 in: ${C(c,"in")} = ${B(l,4)} cu ft, tier ${u}`,formula:"L x W x H / 1,728",ruleRef:"usps-cubic.measuring"});let p=u<=a.priorityMailCubic.maxFt3,f=u<=a.groundAdvantageCubic.maxFt3;return f?{eligible:!0,measured:l,measure:"ft3",tierFt3:u,priorityMail:p,groundAdvantage:f,reason:null}:o(`Over ${a.groundAdvantageCubic.maxFt3} cu ft.`,l)}(t.in,Q,e.packaging,a,n):null;if(O?.eligible){let e=[O.priorityMail&&"Priority Mail Cubic",O.groundAdvantage&&"Ground Advantage Cubic"].filter(Boolean).join(" and ");o.push((0,w.V)("info","USPS_CUBIC_ELIGIBLE",`${i}: qualifies for ${e}, tier ${O.tierFt3}.`))}return r.verifiedOn||o.push((0,w.V)("info","RULE_UNVERIFIED",`${i}: rules come from secondary sources and have not yet been checked against ${i}'s own pages.`)),{result:{carrier:r.id,name:r.name,lengthUnit:c,weightUnit:l,roundedDims:h,volume:x,divisor:E,divisorSource:I?"contract":"published",dimApplied:S,dimWeight:z,actual:P,billable:R,billableLb:null===R?null:s?(0,y.U)(R):R,lengthPlusGirth:D,surcharges:U,cubic:O,flags:o,verified:!!r.verifiedOn},explain:n}}(e,a,t.carriers.carriers[r],t.cubic.cubic);n[r]=i.result,o.push(...i.explain)}return{carriers:n,explain:o}}let E=[["l","length"],["w","width"],["h","height"]];return function calculate(e,t=k,r={}){let a=[{text:`Box ${C([e.l,e.w,e.h],e.unit)}, ${B(e.weight)} ${"in"===e.unit?"lb":"kg"}, packaging: ${e.packaging}`}],{carriers:n,explain:o}=I(e,t);a.push(...o);let i=e.carriers,s=function(e,t){let r=null;for(let a of t){let t=e[a];t&&null!==t.billable&&null!==t.billableLb&&(!r||t.billableLb<r.billableLb-1e-9)&&(r={carrier:a,name:t.name,billable:t.billable,unit:t.weightUnit,billableLb:t.billableLb})}return r}(n,i),c=i.flatMap(e=>n[e]?.flags??[]),l=i.map(e=>(0,w.H)(e,t.carriers.carriers[e]));i.includes("usps")&&l.push((0,w.H)("usps-cubic",t.cubic.cubic));let d={carriers:n,order:i,lowest:s,rightSize:s&&!1!==r.rightSize?function(e,t,r){let a=[],n=e.clearance??0;for(let[o,i]of E){let s=e[o],c=Number.isInteger((0,A.O)(s,9))?(0,A.O)(s,9)-1:Math.floor(s);if(c<Math.max(1,e.product?e.product[o]+2*n:0))continue;let{carriers:l}=I({...e,[o]:c},r),d=[];for(let r of e.carriers){let e=t[r],a=l[r];e?.billable!=null&&a?.billable!=null&&a.billable<e.billable-1e-9&&d.push({carrier:r,name:e.name,before:e.billable,after:a.billable,unit:e.weightUnit})}d.length&&a.push({side:i,from:s,to:c,unit:e.unit,savings:d})}return a}(e,n,t):[]},u=(0,w.X)(d,a,c,l);return u.ok=null!==s,u};
})();
(() => {
  const byId = id => document.getElementById(id);
  const form = byId('parcel');
  const carrierInputs = [...form.querySelectorAll('input[name="carrier"]')];
  const allCarriers = carrierInputs.map(input => input.value);
  const dimensions = ['l','w','h'];
  const optional = ['pl','pw','ph','clearance','divisor'];
  const fmt = n => Number(n).toLocaleString('en-US',{maximumFractionDigits:3});
  const names = {l:'Length',w:'Width',h:'Height',weight:'Actual weight',pl:'Product length',pw:'Product width',ph:'Product height',clearance:'Clearance',divisor:'Contract divisor'};
  const query = new URLSearchParams(location.search);
  let unit = query.get('u') === 'cm' ? 'cm' : 'in';
  let shareURL = '';
  form.elements.units.value = unit;
  for (const [id,key] of Object.entries({l:'l',w:'w',h:'h',weight:'wt',pl:'pl',pw:'pw',ph:'ph',clearance:'cl',divisor:'div'})) {
    if (query.has(key)) byId(id).value = query.get(key);
  }
  if (['box','softpack','mylar','tube'].includes(query.get('p'))) byId('packaging').value=query.get('p');
  if (query.has('c')) for (const input of carrierInputs) input.checked = query.get('c').split(',').includes(input.value);
  if (optional.some(id=>byId(id).value)) form.querySelector('.more').open=true;
  const val = id => byId(id).value === '' ? undefined : Number(byId(id).value);
  function collect() {
    const metric = unit === 'cm';
    const selected = carrierInputs.filter(x=>x.checked).map(x=>x.value);
    const max = metric ? 508 : 200;
    const validate = (id, lower, upper, strict=false) => {
      const n=val(id);
      if (n===undefined || !Number.isFinite(n) || (strict ? n<=lower : n<lower) || n>upper) {
        byId(id).setAttribute('aria-invalid','true');
        throw new Error(names[id]+(strict?' must be greater than 0':' must be at least '+lower)+(Number.isFinite(upper)?' and at most '+upper:'')+'.');
      }
      return n;
    };
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    const params={unit,packaging:byId('packaging').value,carriers:selected};
    for (const id of dimensions) params[id]=validate(id,0,max,true);
    params.weight=validate('weight',0,metric?136:300);
    if(!selected.length) throw new Error('Choose at least one carrier to compare.');
    if(!metric && val('divisor')!==undefined) params.contractDivisor=validate('divisor',100,400);
    if(['pl','pw','ph'].some(id=>val(id)!==undefined)){
      if(['pl','pw','ph'].some(id=>val(id)===undefined))throw new Error('Enter all three product dimensions to apply fit limits.');
      params.product=Object.fromEntries(dimensions.map(id=>[id,validate('p'+id,0,Infinity,true)]));
    }
    if(val('clearance')!==undefined)params.clearance=validate('clearance',0,4);
    return params;
  }
  function saveURL(params){
    const q=new URLSearchParams({l:params.l,w:params.w,h:params.h,u:unit,wt:params.weight});
    if(params.packaging!=='box')q.set('p',params.packaging);
    if(params.carriers.length!==4)q.set('c',params.carriers.join(','));
    if(params.contractDivisor!==undefined)q.set('div',params.contractDivisor);
    if(params.product)for(const id of dimensions)q.set('p'+id,params.product[id]);
    if(params.clearance!==undefined)q.set('cl',params.clearance);
    const url = new URL(location.href);
    url.search=q.toString();
    try {if(location.protocol!=='file:')history.replaceState(null,'',url);} catch {}
    const publicURL = new URL('https://pack-legacy-packaging-toolkit.customboxmakers.chatgpt.site/tools/dimensional-weight-calculator/');
    publicURL.search=q.toString();
    shareURL=publicURL.href;
  }
  const safe = v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = (title,items,ordered=false) => items.length ? '<details><summary>'+safe(title)+'</summary><'+(ordered?'ol':'ul')+'>'+items.map(s=>'<li>'+safe(s)+'</li>').join('')+'</'+(ordered?'ol':'ul')+'></details>' : '';
  function comparison(data, flags, explain){
    const carriers=data.order.map(k=>data.carriers[k]);
    const value=(n,c)=>n===null?'—':fmt(n)+' '+c.weightUnit;
    const rows=[
      ['Billable weight',c=>c.billable===null?'Not accepted':value(c.billable,c)],
      ['Dimensional weight',c=>c.dimApplied?value(c.dimWeight,c):'Not applied'],
      ['Rounded actual weight',c=>value(c.actual,c)],
      ['Rounded size',c=>c.roundedDims.map(fmt).join(' × ')+' '+c.lengthUnit],
      ['Volume',c=>fmt(c.volume)+' '+c.lengthUnit+'³'],
      ['Divisor',c=>fmt(c.divisor)+(c.divisorSource==='contract'?' (contract)':'')],
      ['Length + girth',c=>fmt(c.lengthPlusGirth)+' '+c.lengthUnit],
      ['Surcharges / limits',c=>{const messages=c.flags.filter(f=>['warn','error'].includes(f.level)&&!['LARGE_PACKAGE_MIN_APPLIED'].includes(f.code));return messages.length?messages.map(f=>f.message.replace(c.name+': ','')).join(' '):'None flagged';}],
      ['USPS cubic tier',c=>c.carrier!=='usps'?'—':c.cubic?.eligible?'Tier '+fmt(c.cubic.tierFt3):'Not eligible']
    ];
    const table='<div class="tablewrap" tabindex="0" role="region" aria-label="Billable weight comparison"><table><thead><tr><th scope="col">Measurement</th>'+carriers.map(c=>'<th scope="col">'+safe(c.name)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(([label,cell],i)=>'<tr'+(i===0?' class="bill"':'')+'><th scope="row">'+label+'</th>'+carriers.map(c=>'<td>'+safe(cell(c))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
    const reductions=data.rightSize.map(r=>'Reduce '+r.side+' from '+fmt(r.from)+' to '+fmt(r.to)+' '+r.unit+'. '+r.savings.map(v=>v.name+' drops from '+fmt(v.before)+' to '+fmt(v.after)+' '+v.unit).join(', ')+'.');
    return table+list('Right-size suggestions',reductions);
  }
  function refresh() {
    const length=unit,weight=unit==='in'?'lb':'kg';
    form.querySelectorAll('.length-unit').forEach(el=>el.textContent=length);
    form.querySelector('.weight-unit').textContent=weight;
    byId('divisor').disabled=unit==='cm';
    byId('copy-status').textContent='';
    let params;
    try {params=collect();}
    catch(error){
      byId('input-error').textContent=error.message;byId('input-error').hidden=false;
      for(const id of ['volume','mass','lowest'])byId(id).textContent='—';
      byId('best').textContent='';byId('insight').textContent='Complete the package details to compare weights.';
      byId('comparison-output').textContent='Waiting for valid package details.';
      byId('quote-parcel').removeAttribute('href');byId('copy-url').disabled=true;return;
    }
    byId('input-error').hidden=true;
    const {value:data,flags,explain}=calculateShipment(params);
    byId('volume').textContent=fmt(params.l*params.w*params.h)+' '+length+'³';
    byId('mass').textContent=fmt(params.weight)+' '+weight;
    const lowest=data.lowest;
    if(lowest){
      const tie=data.order.map(k=>data.carriers[k]).filter(c=>c.billableLb!==null&&Math.abs(c.billableLb-lowest.billableLb)<1e-8);
      byId('lowest').innerHTML=fmt(lowest.billable)+' <small>'+safe(lowest.unit)+'</small>';
      byId('best').textContent='with '+tie.map(c=>c.name).join(' / ');
    }else{byId('lowest').textContent='—';byId('best').textContent='Outside selected carrier limits';}
    const notes=flags.filter(f=>f.level!=='info');
    byId('insight').textContent=notes.length?notes[0].message:(flags.find(f=>f.code==='USPS_CUBIC_ELIGIBLE')?.message??'No size or weight surcharges flagged for the selected carriers.');
    byId('comparison-output').innerHTML=comparison(data,flags,explain);
    const body='Please quote packaging for an outside size of '+[params.l,params.w,params.h].join(' × ')+' '+length+' ('+byId('packaging').selectedOptions[0].text+'). Packed weight: '+params.weight+' '+weight+'.';
    byId('quote-parcel').href='mailto:sales@packlegacy.com?subject='+encodeURIComponent('Custom packaging quote request')+'&body='+encodeURIComponent(body);
    byId('copy-url').disabled=false;
    saveURL(params);
  }
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',e=>{
    if(e.target.name==='units'){
      const next=e.target.value, factor=next==='cm'?2.54:1/2.54;
      for(const id of [...dimensions,'pl','pw','ph','clearance','weight']){
        const n=val(id);if(n!==undefined)byId(id).value=String(Number((n*(id==='weight'?(next==='cm'?0.45359237:1/0.45359237):factor)).toFixed(8)));
      }
      unit=next;
    }
    refresh();
  });
  byId('copy-url').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(shareURL);byId('copy-status').textContent='Calculation link copied.';}
    catch {const box=document.createElement('input');box.readOnly=true;box.value=shareURL;box.setAttribute('aria-label','Calculation link');byId('copy-status').replaceChildren(box);box.select();}
  });
  refresh();
})();
