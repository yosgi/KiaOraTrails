import{a as r}from"./chunk-PWAJ3RAI.js";import{a as a}from"./chunk-CXNPIJLB.js";import{h as n}from"./chunk-YWRPWWKI.js";import"./chunk-VTVHUB7E.js";import{a as t,b as o,d as e}from"./chunk-JMSSU44E.js";import{a as s}from"./chunk-4UYSGV57.js";import"./chunk-ANLJ4KBN.js";import"./chunk-ID6SFQTL.js";import"./chunk-VLPNAR64.js";import"./chunk-GE5NEIZC.js";import"./chunk-35CVRQTC.js";var i=new o,p=new t,u=new n,m=new e,c={min:void 0,max:void 0},h=r(function(r,h){var k;let f,l=new Uint16Array(r.positions);k=new Float64Array(k=r.packedBuffer),f=0,c.min=k[f++],c.max=k[f++],n.unpack(k,f,u),f+=n.packedLength,e.unpack(k,f,m);let j=c.min,d=c.max,w=l.length/3,A=l.subarray(0,w),b=l.subarray(w,2*w),g=l.subarray(2*w,3*w);a.zigZagDeltaDecode(A,b,g);let y=new Float64Array(l.length);for(let r=0;r<w;++r){let a=A[r],n=b[r],e=g[r],c=s.lerp(u.west,u.east,a/32767),h=s.lerp(u.south,u.north,n/32767),k=s.lerp(j,d,e/32767),f=o.fromRadians(c,h,k,i),l=m.cartographicToCartesian(f,p);t.pack(l,y,3*r)}return h.push(y.buffer),{positions:y.buffer}});export{h as default};