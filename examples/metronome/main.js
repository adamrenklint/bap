var bap = require('../../index');

var kit = bap.kit();
var basic = bap.oscillator({
  attack: 0.001,
  release: 0.1,
  duration: 10
});

// simple way
var pling = kit.slot(1).layer(basic.with({ 'frequency': 261.6 }));
// more verbose: create, build, then assign
var nextSlot = bap.slot();
nextSlot.layer(basic.with({ 'frequency': 523.3 }));
kit.slot(2, nextSlot);

var pattern = bap.pattern({ 'bars': 2, 'tempo': 120 });
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  ['*.2%1.01', 'A2']
);

// var pattern2 = bap.pattern(/*1 bar, 4 beats per bar*/);
// pattern2.channel(1).add(
//   ['*.*.01', 'A1', 10]
// );

pattern.use('A', kit).start();

// setTimeout(function () {
//   // bap.clock.playing = false;
// //   pattern2.use('A', kit).start();
// //   setTimeout(function () {
// //     pattern.start();
// //   }, 1500);
// }, 1500);


var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.clock.position;
  window.requestAnimationFrame(draw);
}

draw();
