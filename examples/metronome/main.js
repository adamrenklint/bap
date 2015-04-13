var bap = require('../../index');

var kit = bap.kit();
var basic = bap.oscillator({
  'attack': 0.001,
  'release': 0.1,
  'duration': 10,
  'length': 0.5
});
// simple way
var pling = kit.slot(1).layer(basic.with({ 'frequency': 330 }));
// more verbose: create, build, then assign
var nextSlot = bap.slot();
nextSlot.layer(basic.with({ 'frequency': 440 }));
var plong = kit.slot(2, nextSlot);

var pattern = bap.pattern(/*1 bar, 4 beats per bar*/);
pattern.channel(1).add(
  ['*.1.01', 'A1', 40, 50, -50, -50],
  // ['*.1.01', 'A1'],
  ['*.2.01', 'A2'],
  ['*.3.01', 'A2'],
  ['*.4.01', 'A2']
  // ['*.2+.01', 'A2', 10]
  // ['*.!1.01', 'A2']
);

// pattern are automatically looped, sequences are not
setTimeout(function () {
  pattern.use('A', kit).start();
}, 500);

// window.pattern = pattern;
// window.bap = bap;

var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.clock.position;
  window.requestAnimationFrame(draw);
}

draw();
