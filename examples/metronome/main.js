var bap = require('../../index');

// var kit = bap.kit();
// var basic = bap.oscillator({
//   'attack': 0.1,
//   'release': 0.1,
//   'length': 0.1
// });
// var pling = kit.slot(1).layer(basic.with({ 'frequency': 330 }));
// var plong = kit.slot(2).layer(basic.with({ 'frequency': 440 }));

var pattern = bap.pattern(/*1 bar, 4 beats per bar*/);
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  // ['*.2+.01', 'A2', 10]
  ['*.2%1', 'A2']
);

// pattern are automatically looped, sequences are not
// pattern.use('A', kit).start();
// pattern.start();

var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.position;
  window.requestAnimationFrame(draw);
}

draw();
