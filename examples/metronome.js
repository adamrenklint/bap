var bap = require('../index');

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.001,
    release: 0.1,
    length: 0.08
  });

  // simple way
  var pling = kit.slot(1).layer(basic.with({ 'frequency': 330 }));

  // more verbose: create, build, then assign
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ 'frequency': 440 }));
  kit.slot(2, nextSlot);

  var pattern = bap.pattern({ 'bars': 2, 'tempo': 140 });
  pattern.channel(1).add(
    ['*.1.01', 'A1'],
    ['*.2%1.01', 'A2']
  );

  pattern.use('A', kit).start();
}

module.exports = metronome;
