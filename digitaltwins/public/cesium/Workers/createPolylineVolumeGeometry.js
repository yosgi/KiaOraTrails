import{a as e}from"./chunk-4IMXHKCA.js";import{a as t}from"./chunk-AOALMXNW.js";import"./chunk-CXNPIJLB.js";import"./chunk-APUOR5ZJ.js";import{a as n,b as o,c as r}from"./chunk-6BHHTHKE.js";import"./chunk-M5SITFFN.js";import"./chunk-ZPYKVVFF.js";import{a as i}from"./chunk-74GQJJ7R.js";import"./chunk-FNJKWSPR.js";import"./chunk-KSZ5EBRB.js";import{a as a,b as s}from"./chunk-CKMJZ5B3.js";import{a as p}from"./chunk-WNTCOVG2.js";import"./chunk-EEKB62LQ.js";import"./chunk-V3DSE3OK.js";import"./chunk-FMRIJYNG.js";import{a as c}from"./chunk-NNHN6WUY.js";import{a as l}from"./chunk-T7ERZ2CJ.js";import{b as u,c as h,d as m}from"./chunk-GSNDLQ4C.js";import{d as k}from"./chunk-BKSIEBAA.js";import"./chunk-YWRPWWKI.js";import{a as g}from"./chunk-VTVHUB7E.js";import{a as f,c as d,d as y}from"./chunk-JMSSU44E.js";import{a as _}from"./chunk-4UYSGV57.js";import"./chunk-ANLJ4KBN.js";import"./chunk-ID6SFQTL.js";import{a as j}from"./chunk-VLPNAR64.js";import{a as v}from"./chunk-GE5NEIZC.js";import{e as E}from"./chunk-35CVRQTC.js";function L(e){let t=(e=j(e,j.EMPTY_OBJECT)).polylinePositions,o=e.shapePositions;if(!E(t))throw new v("options.polylinePositions is required.");if(!E(o))throw new v("options.shapePositions is required.");this._positions=t,this._shape=o,this._ellipsoid=y.clone(j(e.ellipsoid,y.default)),this._cornerType=j(e.cornerType,n.ROUNDED),this._vertexFormat=i.clone(j(e.vertexFormat,i.DEFAULT)),this._granularity=j(e.granularity,_.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeGeometry";let r=1+t.length*f.packedLength;r+=1+o.length*d.packedLength,this.packedLength=r+y.packedLength+i.packedLength+2}L.pack=function(e,t,n){if(!E(e))throw new v("value is required");if(!E(t))throw new v("array is required");n=j(n,0);let o,r=e._positions,a=r.length;for(t[n++]=a,o=0;o<a;++o,n+=f.packedLength)f.pack(r[o],t,n);let s=e._shape;for(a=s.length,t[n++]=a,o=0;o<a;++o,n+=d.packedLength)d.pack(s[o],t,n);return y.pack(e._ellipsoid,t,n),n+=y.packedLength,i.pack(e._vertexFormat,t,n),n+=i.packedLength,t[n++]=e._cornerType,t[n]=e._granularity,t};var P=y.clone(y.UNIT_SPHERE),T=new i,A={polylinePositions:void 0,shapePositions:void 0,ellipsoid:P,vertexFormat:T,cornerType:void 0,granularity:void 0};L.unpack=function(e,t,n){if(!E(e))throw new v("array is required");t=j(t,0);let o,r=e[t++],a=Array(r);for(o=0;o<r;++o,t+=f.packedLength)a[o]=f.unpack(e,t);let s=Array(r=e[t++]);for(o=0;o<r;++o,t+=d.packedLength)s[o]=d.unpack(e,t);let p=y.unpack(e,t,P);t+=y.packedLength;let c=i.unpack(e,t,T);t+=i.packedLength;let l=e[t++],u=e[t];return E(n)?(n._positions=a,n._shape=s,n._ellipsoid=y.clone(p,n._ellipsoid),n._vertexFormat=i.clone(c,n._vertexFormat),n._cornerType=l,n._granularity=u,n):(A.polylinePositions=a,A.shapePositions=s,A.cornerType=l,A.granularity=u,new L(A))};var w=new e;L.createGeometry=function(n){let i=p(n._positions,f.equalsEpsilon),d=n._shape;if(d=r.removeDuplicatesFromShape(d),i.length<2||d.length<3)return;s.computeWindingOrder2D(d)===a.CLOCKWISE&&d.reverse();let y=e.fromPoints(d,w);return function(e,n,r,i){let a=new l;i.position&&(a.position=new m({componentDatatype:g.DOUBLE,componentsPerAttribute:3,values:e}));let p=n.length,f=e.length/3,d=(f-2*p)/(2*p),y=s.triangulate(n),_=(d-1)*p*6+2*y.length,j=c.createTypedArray(f,_),v,E,L,P,T,A,w=2*p,N=0;for(v=0;v<d-1;v++){for(E=0;E<p-1;E++)A=(L=2*E+v*p*2)+w,T=(P=L+1)+w,j[N++]=P,j[N++]=L,j[N++]=T,j[N++]=T,j[N++]=L,j[N++]=A;T=(P=(L=2*p-2+v*p*2)+1)+w,A=L+w,j[N++]=P,j[N++]=L,j[N++]=T,j[N++]=T,j[N++]=L,j[N++]=A}if(i.st||i.tangent||i.bitangent){let e=new Float32Array(2*f),t=1/(d-1),o=1/r.height,i=r.height/2,s,c,l=0;for(v=0;v<d;v++){for(s=v*t,c=o*(n[0].y+i),e[l++]=s,e[l++]=c,E=1;E<p;E++)c=o*(n[E].y+i),e[l++]=s,e[l++]=c,e[l++]=s,e[l++]=c;c=o*(n[0].y+i),e[l++]=s,e[l++]=c}for(E=0;E<p;E++)s=0,c=o*(n[E].y+i),e[l++]=s,e[l++]=c;for(E=0;E<p;E++)s=(d-1)*t,c=o*(n[E].y+i),e[l++]=s,e[l++]=c;a.st=new m({componentDatatype:g.FLOAT,componentsPerAttribute:2,values:new Float32Array(e)})}let F=f-2*p;for(v=0;v<y.length;v+=3){let e=y[v]+F,t=y[v+1]+F,n=y[v+2]+F;j[N++]=e,j[N++]=t,j[N++]=n,j[N++]=n+p,j[N++]=t+p,j[N++]=e+p}let b=new h({attributes:a,indices:j,boundingSphere:k.fromVertices(e),primitiveType:u.TRIANGLES});if(i.normal&&(b=t.computeNormal(b)),i.tangent||i.bitangent){try{b=t.computeTangentAndBitangent(b)}catch{o("polyline-volume-tangent-bitangent","Unable to compute tangents and bitangents for polyline volume geometry")}i.tangent||(b.attributes.tangent=void 0),i.bitangent||(b.attributes.bitangent=void 0),i.st||(b.attributes.st=void 0)}return b}(r.computePositions(i,d,y,n,!0),d,y,n._vertexFormat)};var N=function(e,t){return E(t)&&(e=L.unpack(e,t)),e._ellipsoid=y.clone(e._ellipsoid),L.createGeometry(e)};export{N as default};