var bap = require('../index');

function slices () {
  var sampleKit = bap.kit();
  var base = bap.sample({
    src: 'sounds/slices.wav',
    attack: 0.01,
    release: 0.01,
    bitcrush: 12,
    channel: 'right'
  });
  sampleKit.slot('Q').layer(base.with({
    offset: 0.072,
    length: 0.719
  }));
  sampleKit.slot('W').layer(base.with({
    offset: 0.9,
    length: 0.750
  }));
  sampleKit.slot('E').layer(base.with({
    offset: 1.68,
    length: 0.690
  }));
  sampleKit.slot('R').layer(base.with({
    offset: 9.49,
    length: 2,
    reverse: true
  }));

  var breakKit = bap.sample({
    src: 'sounds/esther.wav',
    pitch: -26,
    bitcrush: 12
  }).slice(16);
  var crushedSample = bap.sample({
    bitcrush: 12
  });
  breakKit.slot('Q').layer(crushedSample.with({ src: 'sounds/kick.wav' }));
  breakKit.slot('W').layer(crushedSample.with({ src: 'sounds/snare.wav' }));
  breakKit.slot('R').layer(crushedSample.with({ src: 'sounds/snare.wav' }));

  var pattern = bap.pattern({ bars: 2, tempo: 95 });
  pattern.channel(1).add(
    ['1.1.01', '1Q', 96],
    ['1.2.01', '1Q', 96],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.2.80', '1R', (96 * 2) + 16 ]
  );

  pattern.channel(2).add(
    ['1.1.01', '2Q'],
    ['1.2.01', '2W'],
    ['1.3.01', '2E'],
    ['1.4.01', '2R'],
    ['2.1.01', '2Q'],
    ['2.2.01', '2W'],
    ['2.3.01', '2I'],
    ['2.4.01', '2O'],
    ['2.4.49', '2T', 48]
  );

  bap.clock.sequence = pattern
    .kit(1, sampleKit)
    .kit(2, breakKit);
}

module.exports = slices;
