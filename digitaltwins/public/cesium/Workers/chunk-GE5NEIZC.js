import{e as t}from"./chunk-35CVRQTC.js";function e(t){let e;this.name="DeveloperError",this.message=t;try{throw Error()}catch(t){e=t.stack}this.stack=e}t(Object.create)&&(e.prototype=Object.create(Error.prototype),e.prototype.constructor=e),e.prototype.toString=function(){let e=`${this.name}: ${this.message}`;return t(this.stack)&&(e+=`
${this.stack.toString()}`),e},e.throwInstantiationError=function(){throw new e("This function defines an interface and should not be called directly.")};var n=e,o={};function r(t,e,n){return`Expected ${n} to be typeof ${e}, actual typeof was ${t}`}o.typeOf={},o.defined=function(e,o){if(!t(o))throw new n(`${e} is required, actual value was undefined`)},o.typeOf.func=function(t,e){if("function"!=typeof e)throw new n(r(typeof e,"function",t))},o.typeOf.string=function(t,e){if("string"!=typeof e)throw new n(r(typeof e,"string",t))},o.typeOf.number=function(t,e){if("number"!=typeof e)throw new n(r(typeof e,"number",t))},o.typeOf.number.lessThan=function(t,e,r){if(o.typeOf.number(t,e),e>=r)throw new n(`Expected ${t} to be less than ${r}, actual value was ${e}`)},o.typeOf.number.lessThanOrEquals=function(t,e,r){if(o.typeOf.number(t,e),e>r)throw new n(`Expected ${t} to be less than or equal to ${r}, actual value was ${e}`)},o.typeOf.number.greaterThan=function(t,e,r){if(o.typeOf.number(t,e),e<=r)throw new n(`Expected ${t} to be greater than ${r}, actual value was ${e}`)},o.typeOf.number.greaterThanOrEquals=function(t,e,r){if(o.typeOf.number(t,e),e<r)throw new n(`Expected ${t} to be greater than or equal to ${r}, actual value was ${e}`)},o.typeOf.object=function(t,e){if("object"!=typeof e)throw new n(r(typeof e,"object",t))},o.typeOf.bool=function(t,e){if("boolean"!=typeof e)throw new n(r(typeof e,"boolean",t))},o.typeOf.bigint=function(t,e){if("bigint"!=typeof e)throw new n(r(typeof e,"bigint",t))},o.typeOf.number.equals=function(t,e,r,a){if(o.typeOf.number(t,r),o.typeOf.number(e,a),r!==a)throw new n(`${t} must be equal to ${e}, the actual values are ${r} and ${a}`)};var a=o;export{n as a,a as b};