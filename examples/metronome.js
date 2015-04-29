var bap = require('../index');

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.001,
    release: 0.1,
    length: 0.08
  });

  // shorthand, add copy of oscillator as layer on first slot
  kit.slot(1).layer(basic.with({ frequency: 330 }));

  // more verbose: create slot, append oscillator, then assign to kit
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ frequency: 440 }));
  kit.slot(2, nextSlot);

  // create the pattern and add notes using expressions
  var pattern = bap.pattern({ bars: 2, tempo: 140 });
  pattern.channel(1).add(
    ['*.1.01', 'A1'],
    ['*.2%1.01', 'A2']
  );

  pattern.kit('A', kit).start();
  var start = new Date();
  console.log(pattern.notes('1.1.01'));
  console.log(new Date() - start);
}

module.exports = metronome;
