var bap = require('../index');

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.01,
    release: 0.05,
    length: 0.08
  });

  // shorthand, add copy of oscillator as layer on first slot
  kit.slot('Q').layer(basic.with({ frequency: 330 }));

  // more verbose: create slot, append oscillator, then assign to kit
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ frequency: 440 }));
  kit.slot('W', nextSlot);

  // create the pattern and add notes using expressions
  var pattern = bap.pattern({ bars: 2, tempo: 120, volume: 0 });
  pattern.channel(1).add(
    ['*.1.01',   '1Q'],
    ['*.2%1.01', '1W']
  );

  bap.clock.sequence = pattern.kit(kit);
}

module.exports = metronome;
