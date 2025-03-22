import{a as e}from"./chunk-GHQSI7F2.js";import{a as t}from"./chunk-AOALMXNW.js";import{a as n,b as i}from"./chunk-CKMJZ5B3.js";import{a as o}from"./chunk-WNTCOVG2.js";import{a as r}from"./chunk-EEKB62LQ.js";import{b as s}from"./chunk-V3DSE3OK.js";import{a as a}from"./chunk-FMRIJYNG.js";import{a as l}from"./chunk-NNHN6WUY.js";import{a as u}from"./chunk-T7ERZ2CJ.js";import{b as c,c as h,d as f}from"./chunk-GSNDLQ4C.js";import{f as p}from"./chunk-YWRPWWKI.js";import{a as g}from"./chunk-VTVHUB7E.js";import{a as d,b as m,c as y,d as v,e as b}from"./chunk-JMSSU44E.js";import{a as x}from"./chunk-4UYSGV57.js";import{a as T}from"./chunk-VLPNAR64.js";import{e as I}from"./chunk-35CVRQTC.js";var w=function(e,t){this.positions=I(e)?e:[],this.holes=I(t)?t:[]};function E(){this._array=[],this._offset=0,this._length=0}Object.defineProperties(E.prototype,{length:{get:function(){return this._length}}}),E.prototype.enqueue=function(e){this._array.push(e),this._length++},E.prototype.dequeue=function(){if(0===this._length)return;let e=this._array,t=this._offset,n=e[t];return e[t]=void 0,++t>10&&2*t>e.length&&(this._array=e.slice(t),t=0),this._offset=t,this._length--,n},E.prototype.peek=function(){if(0!==this._length)return this._array[this._offset]},E.prototype.contains=function(e){return -1!==this._array.indexOf(e)},E.prototype.clear=function(){this._array.length=this._offset=this._length=0},E.prototype.sort=function(e){this._offset>0&&(this._array=this._array.slice(this._offset),this._offset=0),this._array.sort(e)};var L={};L.computeHierarchyPackedLength=function(e,t){let n=0,i=[e];for(;i.length>0;){let e=i.pop();if(!I(e))continue;n+=2;let o=e.positions,r=e.holes;if(I(o)&&o.length>0&&(n+=o.length*t.packedLength),I(r)){let e=r.length;for(let t=0;t<e;++t)i.push(r[t])}}return n},L.packPolygonHierarchy=function(e,t,n,i){let o=[e];for(;o.length>0;){let e=o.pop();if(!I(e))continue;let r=e.positions,s=e.holes;if(t[n++]=I(r)?r.length:0,t[n++]=I(s)?s.length:0,I(r)){let e=r.length;for(let o=0;o<e;++o,n+=i.packedLength)i.pack(r[o],t,n)}if(I(s)){let e=s.length;for(let t=0;t<e;++t)o.push(s[t])}}return n},L.unpackPolygonHierarchy=function(e,t,n){let i=e[t++],o=e[t++],r=Array(i),s=o>0?Array(o):void 0;for(let o=0;o<i;++o,t+=n.packedLength)r[o]=n.unpack(e,t);for(let i=0;i<o;++i)s[i]=L.unpackPolygonHierarchy(e,t,n),t=s[i].startingIndex,delete s[i].startingIndex;return{positions:r,holes:s,startingIndex:t}};var S=new y;function _(e,t,n,i){return y.subtract(t,e,S),y.multiplyByScalar(S,n/i,S),y.add(e,S,S),[S.x,S.y]}var C=new d;L.subdivideLineCount=function(e,t,n){let i=d.distance(e,t)/n;return Math.pow(2,Math.max(0,Math.ceil(x.log2(i))))};var N=new m,M=new m,A=new m,k=new d,O=new r;L.subdivideRhumbLineCount=function(e,t,n,i){let o=new r(e.cartesianToCartographic(t,N),e.cartesianToCartographic(n,M),e).surfaceDistance/i;return Math.pow(2,Math.max(0,Math.ceil(x.log2(o))))},L.subdivideTexcoordLine=function(e,t,n,i,o,r){let s=L.subdivideLineCount(n,i,o),a=y.distance(e,t),l=a/s;r.length=2*s;let u=0;for(let n=0;n<s;n++){let i=_(e,t,n*l,a);r[u++]=i[0],r[u++]=i[1]}return r},L.subdivideLine=function(e,t,n,i){let o=L.subdivideLineCount(e,t,n),r=d.distance(e,t),s=r/o;I(i)||(i=[]);let a=i;a.length=3*o;let l=0;for(let n=0;n<o;n++){var u;let i=(u=n*s,d.subtract(t,e,C),d.multiplyByScalar(C,u/r,C),d.add(e,C,C),[C.x,C.y,C.z]);a[l++]=i[0],a[l++]=i[1],a[l++]=i[2]}return a},L.subdivideTexcoordRhumbLine=function(e,t,n,i,o,r,s){let a=n.cartesianToCartographic(i,N),l=n.cartesianToCartographic(o,M);O.setEndPoints(a,l);let u=O.surfaceDistance/r,c=Math.pow(2,Math.max(0,Math.ceil(x.log2(u)))),h=y.distance(e,t),f=h/c;s.length=2*c;let p=0;for(let n=0;n<c;n++){let i=_(e,t,n*f,h);s[p++]=i[0],s[p++]=i[1]}return s},L.subdivideRhumbLine=function(e,t,n,i,o){let s=new r(e.cartesianToCartographic(t,N),e.cartesianToCartographic(n,M),e);if(I(o)||(o=[]),s.surfaceDistance<=i)return o.length=3,o[0]=t.x,o[1]=t.y,o[2]=t.z,o;let a=s.surfaceDistance/i,l=Math.pow(2,Math.max(0,Math.ceil(x.log2(a)))),u=s.surfaceDistance/l,c=o;c.length=3*l;let h=0;for(let t=0;t<l;t++){let n=s.interpolateUsingSurfaceDistance(t*u,A),i=e.cartographicToCartesian(n,k);c[h++]=i.x,c[h++]=i.y,c[h++]=i.z}return c};var G=new d,P=new d,R=new d,D=new d;L.scaleToGeodeticHeightExtruded=function(e,t,n,i,o){i=T(i,v.default);let r=P,s=D;if(I(e)&&I(e.attributes)&&I(e.attributes.position)){let a=e.attributes.position.values,l=a.length/2;for(let e=0;e<l;e+=3)d.fromArray(a,e,R),i.geodeticSurfaceNormal(R,G),s=i.scaleToGeodeticSurface(R,s),r=d.multiplyByScalar(G,n,r),r=d.add(s,r,r),a[e+l]=r.x,a[e+1+l]=r.y,a[e+2+l]=r.z,o&&(s=d.clone(R,s)),r=d.multiplyByScalar(G,t,r),r=d.add(s,r,r),a[e]=r.x,a[e+1]=r.y,a[e+2]=r.z}return e},L.polygonOutlinesFromHierarchy=function(e,t,n){let i,r,s,a=[],l=new E;for(l.enqueue(e);0!==l.length;){let e=l.dequeue(),u=e.positions;if(t)for(s=u.length,i=0;i<s;i++)n.scaleToGeodeticSurface(u[i],u[i]);if((u=o(u,d.equalsEpsilon,!0)).length<3)continue;let c=e.holes?e.holes.length:0;for(i=0;i<c;i++){let u=e.holes[i],c=u.positions;if(t)for(s=c.length,r=0;r<s;++r)n.scaleToGeodeticSurface(c[r],c[r]);if((c=o(c,d.equalsEpsilon,!0)).length<3)continue;a.push(c);let h=0;for(I(u.holes)&&(h=u.holes.length),r=0;r<h;r++)l.enqueue(u.holes[r])}a.push(u)}return a};var j=new m,q=new m;L.splitPolygonsOnEquator=function(t,n,i,o){I(o)||(o=[]),o.splice(0,0,...t),o.length=t.length;let r=0;for(;r<o.length;){let t=o[r],l=t.slice();if(t.length<3){o[r]=l,++r;continue}let u=function(t,n,i){let o=[],r,l,u,c,h,f=0;for(;f<t.length;){r=t[f],l=t[(f+1)%t.length],u=x.sign(r.z),c=x.sign(l.z);let p=e=>n.cartesianToCartographic(e,q).longitude;if(0===u)o.push({position:f,type:u,visited:!1,next:c,theta:p(r)});else if(0!==c){if(h=function(t,n,i,o){if(o===e.RHUMB)return function(e,t,n){let i=n.cartesianToCartographic(e,N),o=n.cartesianToCartographic(t,M);if(Math.sign(i.latitude)===Math.sign(o.latitude))return;O.setEndPoints(i,o);let r=O.findIntersectionWithLatitude(0,j);if(!I(r))return;let s=Math.min(i.longitude,o.longitude),a=Math.max(i.longitude,o.longitude);if(Math.abs(a-s)>x.PI){let e=s;s=a,a=e}if(!(r.longitude<s||r.longitude>a))return n.cartographicToCartesian(r)}(t,n,i);let r=s.lineSegmentPlane(t,n,a.ORIGIN_XY_PLANE);if(I(r))return i.scaleToGeodeticSurface(r,r)}(r,l,n,i),++f,!I(h))continue;t.splice(f,0,h),o.push({position:f,type:u,visited:!1,next:c,theta:p(h)})}++f}return o}(l,n,i);if(l.length===t.length||u.length<=1){o[r]=l,++r;continue}u.sort((e,t)=>e.theta-t.theta);let c=l[0].z>=0;r=function e(t,n,i,o,r,s,a){let l=[],u=s,c=e=>t=>t.position===e,h=[];do{let e=i[u];l.push(e);let t=o.findIndex(c(u)),n=o[t];if(!I(n)){++u;continue}let{visited:r,type:f,next:p}=n;if(n.visited=!0,0===f){if(0===p){let e=o[t-(a?1:-1)];if(e?.position===u+1)e.visited=!0;else{++u;continue}}if(!r&&a&&p>0||s===u&&!a&&p<0){++u;continue}}if(!(a?f>=0:f<=0)){++u;continue}r||h.push(u);let g=o[t+(a?1:-1)];if(!I(g)){++u;continue}u=g.position}while(u<i.length&&u>=0&&u!==s&&l.length<i.length);for(let s of(t.splice(n,r,l),h))n=e(t,++n,i,o,0,s,!a);return n}(o,r,l,u,1,0,c)}return o},L.polygonsFromHierarchy=function(e,t,r,s,a,l){let u=[],c=[],h=new E;h.enqueue(e);let f=I(l);for(;0!==h.length;){let e=h.dequeue(),p=e.positions,g=e.holes,m,y;if(s)for(y=p.length,m=0;m<y;m++)a.scaleToGeodeticSurface(p[m],p[m]);if(t||(p=o(p,d.equalsEpsilon,!0)),p.length<3)continue;let v=r(p);if(!I(v))continue;let b=[],x=i.computeWindingOrder2D(v);if(x===n.CLOCKWISE&&(v.reverse(),p=p.slice().reverse()),f){f=!1;let e=[p];if((e=l(e,e)).length>1){for(let t of e)h.enqueue(new w(t,g));continue}}let T=p.slice(),E=I(g)?g.length:0,L=[],S;for(m=0;m<E;m++){let e=g[m],l=e.positions;if(s)for(y=l.length,S=0;S<y;++S)a.scaleToGeodeticSurface(l[S],l[S]);if(t||(l=o(l,d.equalsEpsilon,!0)),l.length<3)continue;let u=r(l);if(!I(u))continue;(x=i.computeWindingOrder2D(u))===n.CLOCKWISE&&(u.reverse(),l=l.slice().reverse()),L.push(l),b.push(T.length),T=T.concat(l),v=v.concat(u);let c=0;for(I(e.holes)&&(c=e.holes.length),S=0;S<c;S++)h.enqueue(e.holes[S])}u.push({outerRing:p,holes:L}),c.push({positions:T,positions2D:v,holes:b})}return{hierarchy:u,polygons:c}};var B=new y,H=new d,z=new p,V=new b;L.computeBoundingRectangle=function(e,t,n,i,o){let r=p.fromAxisAngle(e,i,z),s=b.fromQuaternion(r,V),a=Number.POSITIVE_INFINITY,l=Number.NEGATIVE_INFINITY,u=Number.POSITIVE_INFINITY,c=Number.NEGATIVE_INFINITY,h=n.length;for(let e=0;e<h;++e){let i=d.clone(n[e],H);b.multiplyByVector(s,i,i);let o=t(i,B);I(o)&&(a=Math.min(a,o.x),l=Math.max(l,o.x),u=Math.min(u,o.y),c=Math.max(c,o.y))}return o.x=a,o.y=u,o.width=l-a,o.height=c-u,o},L.createGeometryFromPositions=function(n,o,r,s,a,l,u){let p=i.triangulate(o.positions2D,o.holes);p.length<3&&(p=[0,1,2]);let d=o.positions,m=I(r),v=m?r.positions:void 0;if(a){let e=d.length,n=Array(3*e),i=0;for(let t=0;t<e;t++){let e=d[t];n[i++]=e.x,n[i++]=e.y,n[i++]=e.z}let o={attributes:{position:new f({componentDatatype:g.DOUBLE,componentsPerAttribute:3,values:n})},indices:p,primitiveType:c.TRIANGLES};m&&(o.attributes.st=new f({componentDatatype:g.FLOAT,componentsPerAttribute:2,values:y.packArray(v)}));let r=new h(o);return l.normal?t.computeNormal(r):r}return u===e.GEODESIC?i.computeSubdivision(n,d,p,v,s):u===e.RHUMB?i.computeRhumbLineSubdivision(n,d,p,v,s):void 0};var W=[],F=[],U=new d,Y=new d;L.computeWallGeometry=function(t,n,i,o,r,s){let a,p,m,y,v,b,T,w,E,S=t.length,_=0,C=0,N=I(n),M=N?n.positions:void 0;if(r)for(a=Array(2*(p=6*S)),N&&(w=Array(2*(E=4*S))),m=0;m<S;m++)y=t[m],v=t[(m+1)%S],a[_]=a[_+p]=y.x,a[++_]=a[_+p]=y.y,a[++_]=a[_+p]=y.z,a[++_]=a[_+p]=v.x,a[++_]=a[_+p]=v.y,a[++_]=a[_+p]=v.z,++_,N&&(b=M[m],T=M[(m+1)%S],w[C]=w[C+E]=b.x,w[++C]=w[C+E]=b.y,w[++C]=w[C+E]=T.x,w[++C]=w[C+E]=T.y,++C);else{let n=x.chordLength(o,i.maximumRadius),r=0;if(s===e.GEODESIC)for(m=0;m<S;m++)r+=L.subdivideLineCount(t[m],t[(m+1)%S],n);else if(s===e.RHUMB)for(m=0;m<S;m++)r+=L.subdivideRhumbLineCount(i,t[m],t[(m+1)%S],n);for(a=Array(2*(p=(r+S)*3)),N&&(w=Array(2*(E=(r+S)*2))),m=0;m<S;m++){let o,r;y=t[m],v=t[(m+1)%S],N&&(b=M[m],T=M[(m+1)%S]),s===e.GEODESIC?(o=L.subdivideLine(y,v,n,F),N&&(r=L.subdivideTexcoordLine(b,T,y,v,n,W))):s===e.RHUMB&&(o=L.subdivideRhumbLine(i,y,v,n,F),N&&(r=L.subdivideTexcoordRhumbLine(b,T,i,y,v,n,W)));let l=o.length;for(let e=0;e<l;++e,++_)a[_]=o[e],a[_+p]=o[e];if(a[_]=v.x,a[_+p]=v.x,a[++_]=v.y,a[_+p]=v.y,a[++_]=v.z,a[_+p]=v.z,++_,N){let e=r.length;for(let t=0;t<e;++t,++C)w[C]=r[t],w[C+E]=r[t];w[C]=T.x,w[C+E]=T.x,w[++C]=T.y,w[C+E]=T.y,++C}}}S=a.length;let A=l.createTypedArray(S/3,S-6*t.length),k=0;for(S/=6,m=0;m<S;m++){let e=m,t=e+1,n=e+S,i=n+1;y=d.fromArray(a,3*e,U),v=d.fromArray(a,3*t,Y),d.equalsEpsilon(y,v,x.EPSILON10,x.EPSILON10)||(A[k++]=e,A[k++]=n,A[k++]=t,A[k++]=t,A[k++]=n,A[k++]=i)}let O={attributes:new u({position:new f({componentDatatype:g.DOUBLE,componentsPerAttribute:3,values:a})}),indices:A,primitiveType:c.TRIANGLES};return N&&(O.attributes.st=new f({componentDatatype:g.FLOAT,componentsPerAttribute:2,values:w})),new h(O)};var K=L;export{K as a};