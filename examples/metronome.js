var bap = require('../index');

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.001,
    release: 0.1,
    length: 0.08
  });

  // shorthand, add copy of oscillator as layer on first slot
  kit.slot('Q').layer(basic.with({ frequency: 330 }));

  // more verbose: create slot, append oscillator, then assign to kit
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ frequency: 440 }));
  kit.slot('W', nextSlot);

  // create the pattern and add notes using expressions
  var pattern = bap.pattern({ bars: 2, tempo: 140 });
  pattern.channel(1).add(
    ['*.1.01',   '1Q'],
    ['*.2%1.01', '1W']
  );

  // var step = 500;
  // function one () {
  //   kit.slot('Q').start();
  //   setTimeout(two, step);
  // }
  // function two () {
  //   kit.slot('W').start();
  //   setTimeout(three, step);
  // }
  // function three () {
  //   kit.slot('W').start();
  //   setTimeout(four, step);
  // }
  // function four () {
  //   kit.slot('W').start();
  //   setTimeout(one, step);
  // }
  //
  // setTimeout(one, 1000);
  bap.clock.sequence = pattern.kit(kit);
}

module.exports = metronome;
