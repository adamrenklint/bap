// var Base = require('./Base');
// var inherits = require('util').inherits;
// var Clock = require('./Clock');
// var audioContext = require('audio-context');
//
// function Bap (params) {
//
//   Base.call(this, params);
//
//   this.params.context = this.params.context || audioContext;
//   this.params.clock = this.params.clock || new Clock(this.params);
// }
//
// inherits(Bap, Base);
//
// var constructors = {
//   'Pattern': require('./Pattern'),
//   'Kit': require('./Kit')
// };
// Object.keys(constructors).forEach(function (name) {
//   var Ctor = constructors[name];
//   // Bap.prototype[name] = Ctor;
//   Bap.prototype[name.toLowerCase()] = function (params) {
//     params = params || {};
//     params.context = params.context || this.params.context;
//     params.clock = params.clock || this.params.clock;
//     return new Ctor(params);
//   };
// });
//
// module.exports = Bap;
