(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bap = require('../../index');

// var kit = bap.kit();
// var basic = bap.oscillator({
//   'attack': 0.1,
//   'release': 0.1,
//   'length': 0.1
// });
// // simple way
// var pling = kit.slot(1).layer(basic.with({ 'frequency': 330 }));
// // more verbose: create, build, then assign
// var nextSlot = bap.slot();
// nextSlot.layer(basic.with({ 'frequency': 440 }));
// var plong = kit.slot(2, nextSlot);

var pattern = bap.pattern(/*1 bar, 4 beats per bar*/);
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  ['*.2.01', 'A2'],
  ['*.3.01', 'A2'],
  ['*.4.01', 'A2']
  // ['*.2+.01', 'A2', 10]
  // ['*.!1.01', 'A2']
);

// pattern are automatically looped, sequences are not
// pattern.use('A', kit).start();
pattern.start();

var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.position;
  window.requestAnimationFrame(draw);
}

draw();

},{"../../index":2}],2:[function(require,module,exports){
var Bap = require('./lib/Bap');
module.exports = new Bap();

},{"./lib/Bap":3}],3:[function(require,module,exports){
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

},{}]},{},[1]);
