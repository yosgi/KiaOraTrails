import{a as e,b as n}from"./chunk-YWRPWWKI.js";import{a as t}from"./chunk-JMSSU44E.js";import{a as o}from"./chunk-4UYSGV57.js";import{a as a,b as r}from"./chunk-GE5NEIZC.js";import{e as i}from"./chunk-35CVRQTC.js";function c(e,n){if(r.typeOf.object("normal",e),!o.equalsEpsilon(t.magnitude(e),1,o.EPSILON6))throw new a("normal must be normalized.");r.typeOf.number("distance",n),this.normal=t.clone(e),this.distance=n}c.fromPointNormal=function(e,n,l){if(r.typeOf.object("point",e),r.typeOf.object("normal",n),!o.equalsEpsilon(t.magnitude(n),1,o.EPSILON6))throw new a("normal must be normalized.");let s=-t.dot(n,e);return i(l)?(t.clone(n,l.normal),l.distance=s,l):new c(n,s)};var l=new t;c.fromCartesian4=function(e,n){r.typeOf.object("coefficients",e);let s=t.fromCartesian4(e,l),m=e.w;if(!o.equalsEpsilon(t.magnitude(s),1,o.EPSILON6))throw new a("normal must be normalized.");return i(n)?(t.clone(s,n.normal),n.distance=m,n):new c(s,m)},c.getPointDistance=function(e,n){return r.typeOf.object("plane",e),r.typeOf.object("point",n),t.dot(e.normal,n)+e.distance};var s=new t;c.projectPointOntoPlane=function(e,n,o){r.typeOf.object("plane",e),r.typeOf.object("point",n),i(o)||(o=new t);let a=c.getPointDistance(e,n),l=t.multiplyByScalar(e.normal,a,s);return t.subtract(n,l,o)};var m=new n,f=new e,u=new t;c.transform=function(o,a,i){r.typeOf.object("plane",o),r.typeOf.object("transform",a);let l=o.normal,s=o.distance,p=n.inverseTranspose(a,m),O=e.fromElements(l.x,l.y,l.z,s,f);O=n.multiplyByVector(p,O,O);let b=t.fromCartesian4(O,u);return O=e.divideByScalar(O,t.magnitude(b),O),c.fromCartesian4(O,i)},c.clone=function(e,n){return r.typeOf.object("plane",e),i(n)?(t.clone(e.normal,n.normal),n.distance=e.distance,n):new c(e.normal,e.distance)},c.equals=function(e,n){return r.typeOf.object("left",e),r.typeOf.object("right",n),e.distance===n.distance&&t.equals(e.normal,n.normal)},c.ORIGIN_XY_PLANE=Object.freeze(new c(t.UNIT_Z,0)),c.ORIGIN_YZ_PLANE=Object.freeze(new c(t.UNIT_X,0)),c.ORIGIN_ZX_PLANE=Object.freeze(new c(t.UNIT_Y,0));var p=c;export{p as a};