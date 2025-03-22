import{a as e}from"./chunk-EEKB62LQ.js";import{b as t,c as n,d as r}from"./chunk-GSNDLQ4C.js";import{a as i}from"./chunk-VTVHUB7E.js";import{a,b as u,c as x,d as l}from"./chunk-JMSSU44E.js";import{a as o}from"./chunk-4UYSGV57.js";import{a as p}from"./chunk-ANLJ4KBN.js";import{a as f}from"./chunk-VLPNAR64.js";import{b as y}from"./chunk-GE5NEIZC.js";import{e as s}from"./chunk-35CVRQTC.js";var h={CLOCKWISE:p.CW,COUNTER_CLOCKWISE:p.CCW};h.validate=function(e){return e===h.CLOCKWISE||e===h.COUNTER_CLOCKWISE};var c=Object.freeze(h);function m(e,t,n,r,i){let a;if(i===function(e,t,n,r){let i=0;for(let a=t,u=n-r;a<n;a+=r)i+=(e[u]-e[a])*(e[a+1]+e[u+1]),u=a;return i}(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=z(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=z(i/r|0,e[i],e[i+1],a);return a&&E(a,a.next)&&(T(a),a=a.next),a}function d(e,t){if(!e)return e;t||(t=e);let n=e,r;do if(r=!1,!n.steiner&&(E(n,n.next)||0===S(n.prev,n,n.next))){if(T(n),(n=t=n.prev)===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function v(e,t){let n=e.x-t.x;return 0===n&&0==(n=e.y-t.y)&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x)),n}function g(e,t,n,r,i){return(e=((e=((e=((e=((e=(e-n)*i|0)|e<<8)&0xff00ff)|e<<4)&0xf0f0f0f)|e<<2)&0x33333333)|e<<1)&0x55555555)|(t=((t=((t=((t=((t=(t-r)*i|0)|t<<8)&0xff00ff)|t<<4)&0xf0f0f0f)|t<<2)&0x33333333)|t<<1)&0x55555555)<<1}function w(e,t,n,r,i,a,u,x){return(i-u)*(t-x)>=(e-u)*(a-x)&&(e-u)*(r-x)>=(n-u)*(t-x)&&(n-u)*(a-x)>=(i-u)*(r-x)}function A(e,t,n,r,i,a,u,x){return(e!==u||t!==x)&&w(e,t,n,r,i,a,u,x)}function S(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function E(e,t){return e.x===t.x&&e.y===t.y}function b(e,t,n,r){let i=Z(S(e,t,n)),a=Z(S(e,t,r)),u=Z(S(n,r,e)),x=Z(S(n,r,t));return!!(i!==a&&u!==x||0===i&&M(e,n,t)||0===a&&M(e,r,t)||0===u&&M(n,e,r)||0===x&&M(n,t,r))}function M(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Z(e){return e>0?1:e<0?-1:0}function O(e,t){return 0>S(e.prev,e,e.next)?S(e,t,e.next)>=0&&S(e,e.prev,t)>=0:0>S(e,t,e.prev)||0>S(e,e.next,t)}function C(e,t){let n=L(e.i,e.x,e.y),r=L(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function z(e,t,n,r){let i=L(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function T(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function L(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}var R=new a,B=new a,D={};D.computeArea2D=function(e){y.defined("positions",e),y.typeOf.number.greaterThanOrEquals("positions.length",e.length,3);let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++){let t=e[r],a=e[i];n+=t.x*a.y-a.x*t.y}return .5*n},D.computeWindingOrder2D=function(e){return D.computeArea2D(e)>0?c.COUNTER_CLOCKWISE:c.CLOCKWISE},D.triangulate=function(e,t){return y.defined("positions",e),function(e,t,n=2){let r,i,a,u=t&&t.length,x=u?t[0]*n:e.length,l=m(e,0,x,n,!0),o=[];if(!l||l.next===l.prev)return o;if(u&&(l=function(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let u=t[n]*r,x=n<a-1?t[n+1]*r:e.length,l=m(e,u,x,r,!1);l===l.next&&(l.steiner=!0),i.push(function(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}(l))}i.sort(v);for(let e=0;e<i.length;e++)n=function(e,t){let n=function(e,t){let n=t,r=e.x,i=e.y,a=-1/0,u;if(E(e,n))return n;do{if(E(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,u=n.x<n.next.x?n:n.next,e===r))return u}n=n.next}while(n!==t);if(!u)return null;let x=u,l=u.x,o=u.y,p=1/0;n=u;do{if(r>=n.x&&n.x>=l&&r!==n.x&&w(i<o?r:a,i,l,o,i<o?a:r,i,n.x,n.y)){var f,y;let t=Math.abs(i-n.y)/(r-n.x);O(n,e)&&(t<p||t===p&&(n.x>u.x||n.x===u.x&&(f=u,y=n,0>S(f.prev,f,y.prev)&&0>S(y.next,f,f.next))))&&(u=n,p=t)}n=n.next}while(n!==x);return u}(e,t);if(!n)return t;let r=C(n,e);return d(r,r.next),d(n,n.next)}(i[e],n);return n}(e,t,l,n)),e.length>80*n){r=1/0,i=1/0;let t=-1/0,u=-1/0;for(let a=n;a<x;a+=n){let n=e[a],x=e[a+1];n<r&&(r=n),x<i&&(i=x),n>t&&(t=n),x>u&&(u=x)}a=0!==(a=Math.max(t-r,u-i))?32767/a:0}return function e(t,n,r,i,a,u,x){if(!t)return;!x&&u&&function(e,t,n,r){let i=e;do 0===i.z&&(i.z=g(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,function(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let u=r,x=0;for(let e=0;e<n&&(x++,u=u.nextZ);e++);let l=n;for(;x>0||l>0&&u;)0!==x&&(0===l||!u||r.z<=u.z)?(i=r,r=r.nextZ,x--):(i=u,u=u.nextZ,l--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=u}a.nextZ=null,n*=2}while(t>1)}(i)}(t,i,a,u);let l=t;for(;t.prev!==t.next;){let o=t.prev,p=t.next;if(u?function(e,t,n,r){let i=e.prev,a=e.next;if(S(i,e,a)>=0)return!1;let u=i.x,x=e.x,l=a.x,o=i.y,p=e.y,f=a.y,y=Math.min(u,x,l),s=Math.min(o,p,f),h=Math.max(u,x,l),c=Math.max(o,p,f),m=g(y,s,t,n,r),d=g(h,c,t,n,r),v=e.prevZ,w=e.nextZ;for(;v&&v.z>=m&&w&&w.z<=d;){if(v.x>=y&&v.x<=h&&v.y>=s&&v.y<=c&&v!==i&&v!==a&&A(u,o,x,p,l,f,v.x,v.y)&&S(v.prev,v,v.next)>=0||(v=v.prevZ,w.x>=y&&w.x<=h&&w.y>=s&&w.y<=c&&w!==i&&w!==a&&A(u,o,x,p,l,f,w.x,w.y)&&S(w.prev,w,w.next)>=0))return!1;w=w.nextZ}for(;v&&v.z>=m;){if(v.x>=y&&v.x<=h&&v.y>=s&&v.y<=c&&v!==i&&v!==a&&A(u,o,x,p,l,f,v.x,v.y)&&S(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;w&&w.z<=d;){if(w.x>=y&&w.x<=h&&w.y>=s&&w.y<=c&&w!==i&&w!==a&&A(u,o,x,p,l,f,w.x,w.y)&&S(w.prev,w,w.next)>=0)return!1;w=w.nextZ}return!0}(t,i,a,u):function(e){let t=e.prev,n=e.next;if(S(t,e,n)>=0)return!1;let r=t.x,i=e.x,a=n.x,u=t.y,x=e.y,l=n.y,o=Math.min(r,i,a),p=Math.min(u,x,l),f=Math.max(r,i,a),y=Math.max(u,x,l),s=n.next;for(;s!==t;){if(s.x>=o&&s.x<=f&&s.y>=p&&s.y<=y&&A(r,u,i,x,a,l,s.x,s.y)&&S(s.prev,s,s.next)>=0)return!1;s=s.next}return!0}(t)){n.push(o.i,t.i,p.i),T(t),t=p.next,l=p.next;continue}if((t=p)===l){x?1===x?e(t=function(e,t){let n=e;do{let r=n.prev,i=n.next.next;!E(r,i)&&b(r,n,n.next,i)&&O(r,i)&&O(i,r)&&(t.push(r.i,n.i,i.i),T(n),T(n.next),n=e=i),n=n.next}while(n!==e);return d(n)}(d(t),n),n,r,i,a,u,2):2===x&&function(t,n,r,i,a,u){let x=t;do{let t=x.next.next;for(;t!==x.prev;){var l,o;if(x.i!==t.i&&(l=x,o=t,l.next.i!==o.i&&l.prev.i!==o.i&&!function(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&b(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}(l,o)&&(O(l,o)&&O(o,l)&&function(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}(l,o)&&(S(l.prev,l,o.prev)||S(l,o.prev,o))||E(l,o)&&S(l.prev,l,l.next)>0&&S(o.prev,o,o.next)>0))){let l=C(x,t);x=d(x,x.next),l=d(l,l.next),e(x,n,r,i,a,u,0),e(l,n,r,i,a,u,0);return}t=t.next}x=x.next}while(x!==t)}(t,n,r,i,a,u):e(d(t),n,r,i,a,u,1);break}}}(l,o,n,r,i,a,0),o}(x.packArray(e),t,2)};var N=new a,j=new a,k=new a,$=new a,I=new a,U=new a,P=new a,G=new x,W=new x,q=new x,K=new x;D.computeSubdivision=function(e,u,l,p,h){h=f(h,o.RADIANS_PER_DEGREE);let c=s(p);y.typeOf.object("ellipsoid",e),y.defined("positions",u),y.defined("indices",l),y.typeOf.number.greaterThanOrEquals("indices.length",l.length,3),y.typeOf.number.equals("indices.length % 3","0",l.length%3,0),y.typeOf.number.greaterThan("granularity",h,0);let m=l.slice(0),d,v=u.length,g=Array(3*v),w=Array(2*v),A=0,S=0;for(d=0;d<v;d++){let e=u[d];if(g[A++]=e.x,g[A++]=e.y,g[A++]=e.z,c){let e=p[d];w[S++]=e.x,w[S++]=e.y}}let E=[],b={},M=e.maximumRadius,Z=o.chordLength(h,M),O=Z*Z;for(;m.length>0;){let e=m.pop(),t=m.pop(),n=m.pop(),r=a.fromArray(g,3*n,N),i=a.fromArray(g,3*t,j),u=a.fromArray(g,3*e,k),l,o,p;c&&(l=x.fromArray(w,2*n,G),o=x.fromArray(w,2*t,W),p=x.fromArray(w,2*e,q));let f=a.multiplyByScalar(a.normalize(r,$),M,$),y=a.multiplyByScalar(a.normalize(i,I),M,I),h=a.multiplyByScalar(a.normalize(u,U),M,U),v=a.magnitudeSquared(a.subtract(f,y,P)),A=a.magnitudeSquared(a.subtract(y,h,P)),S=a.magnitudeSquared(a.subtract(h,f,P)),Z=Math.max(v,A,S),C,z,T;Z>O?v===Z?(s(d=b[C=`${Math.min(n,t)} ${Math.max(n,t)}`])||(z=a.add(r,i,P),a.multiplyByScalar(z,.5,z),g.push(z.x,z.y,z.z),d=g.length/3-1,b[C]=d,c&&(T=x.add(l,o,K),x.multiplyByScalar(T,.5,T),w.push(T.x,T.y))),m.push(n,d,e),m.push(d,t,e)):A===Z?(s(d=b[C=`${Math.min(t,e)} ${Math.max(t,e)}`])||(z=a.add(i,u,P),a.multiplyByScalar(z,.5,z),g.push(z.x,z.y,z.z),d=g.length/3-1,b[C]=d,c&&(T=x.add(o,p,K),x.multiplyByScalar(T,.5,T),w.push(T.x,T.y))),m.push(t,d,n),m.push(d,e,n)):S===Z&&(s(d=b[C=`${Math.min(e,n)} ${Math.max(e,n)}`])||(z=a.add(u,r,P),a.multiplyByScalar(z,.5,z),g.push(z.x,z.y,z.z),d=g.length/3-1,b[C]=d,c&&(T=x.add(p,l,K),x.multiplyByScalar(T,.5,T),w.push(T.x,T.y))),m.push(e,d,t),m.push(d,n,t)):(E.push(n),E.push(t),E.push(e))}let C={attributes:{position:new r({componentDatatype:i.DOUBLE,componentsPerAttribute:3,values:g})},indices:E,primitiveType:t.TRIANGLES};return c&&(C.attributes.st=new r({componentDatatype:i.FLOAT,componentsPerAttribute:2,values:w})),new n(C)};var _=new u,F=new u,V=new u,Q=new u;D.computeRhumbLineSubdivision=function(u,l,p,h,c){c=f(c,o.RADIANS_PER_DEGREE);let m=s(h);y.typeOf.object("ellipsoid",u),y.defined("positions",l),y.defined("indices",p),y.typeOf.number.greaterThanOrEquals("indices.length",p.length,3),y.typeOf.number.equals("indices.length % 3","0",p.length%3,0),y.typeOf.number.greaterThan("granularity",c,0);let d=p.slice(0),v,g=l.length,w=Array(3*g),A=Array(2*g),S=0,E=0;for(v=0;v<g;v++){let e=l[v];if(w[S++]=e.x,w[S++]=e.y,w[S++]=e.z,m){let e=h[v];A[E++]=e.x,A[E++]=e.y}}let b=[],M={},Z=u.maximumRadius,O=o.chordLength(c,Z),C=new e(void 0,void 0,u),z=new e(void 0,void 0,u),T=new e(void 0,void 0,u);for(;d.length>0;){let e=d.pop(),t=d.pop(),n=d.pop(),r=a.fromArray(w,3*n,N),i=a.fromArray(w,3*t,j),l=a.fromArray(w,3*e,k),o,p,f;m&&(o=x.fromArray(A,2*n,G),p=x.fromArray(A,2*t,W),f=x.fromArray(A,2*e,q));let y=u.cartesianToCartographic(r,_),h=u.cartesianToCartographic(i,F),c=u.cartesianToCartographic(l,V);C.setEndPoints(y,h);let g=C.surfaceDistance;z.setEndPoints(h,c);let S=z.surfaceDistance;T.setEndPoints(c,y);let E=T.surfaceDistance,Z=Math.max(g,S,E),L,R,B,D,$;Z>O?g===Z?(s(v=M[L=`${Math.min(n,t)} ${Math.max(n,t)}`])||(R=C.interpolateUsingFraction(.5,Q),B=(y.height+h.height)*.5,D=a.fromRadians(R.longitude,R.latitude,B,u,P),w.push(D.x,D.y,D.z),v=w.length/3-1,M[L]=v,m&&($=x.add(o,p,K),x.multiplyByScalar($,.5,$),A.push($.x,$.y))),d.push(n,v,e),d.push(v,t,e)):S===Z?(s(v=M[L=`${Math.min(t,e)} ${Math.max(t,e)}`])||(R=z.interpolateUsingFraction(.5,Q),B=(h.height+c.height)*.5,D=a.fromRadians(R.longitude,R.latitude,B,u,P),w.push(D.x,D.y,D.z),v=w.length/3-1,M[L]=v,m&&($=x.add(p,f,K),x.multiplyByScalar($,.5,$),A.push($.x,$.y))),d.push(t,v,n),d.push(v,e,n)):E===Z&&(s(v=M[L=`${Math.min(e,n)} ${Math.max(e,n)}`])||(R=T.interpolateUsingFraction(.5,Q),B=(c.height+y.height)*.5,D=a.fromRadians(R.longitude,R.latitude,B,u,P),w.push(D.x,D.y,D.z),v=w.length/3-1,M[L]=v,m&&($=x.add(f,o,K),x.multiplyByScalar($,.5,$),A.push($.x,$.y))),d.push(e,v,t),d.push(v,n,t)):(b.push(n),b.push(t),b.push(e))}let L={attributes:{position:new r({componentDatatype:i.DOUBLE,componentsPerAttribute:3,values:w})},indices:b,primitiveType:t.TRIANGLES};return m&&(L.attributes.st=new r({componentDatatype:i.FLOAT,componentsPerAttribute:2,values:A})),new n(L)},D.scaleToGeodeticHeight=function(e,t,n,r){n=f(n,l.default);let i=R,u=B;if(t=f(t,0),r=f(r,!0),s(e)){let x=e.length;for(let l=0;l<x;l+=3)a.fromArray(e,l,u),r&&(u=n.scaleToGeodeticSurface(u,u)),0!==t&&(i=n.geodeticSurfaceNormal(u,i),a.multiplyByScalar(i,t,i),a.add(u,i,u)),e[l]=u.x,e[l+1]=u.y,e[l+2]=u.z}return e};var H=D;export{c as a,H as b};