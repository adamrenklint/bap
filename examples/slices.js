var bap = require('../index');

function slices () {
  var sampleKit = bap.kit();
  var base = bap.sample({
    src: 'sounds/slices.wav',
    attack: 0.01,
    release: 0.01
  });
  sampleKit.slot(1).layer(base.with({
    offset: 0.072,
    length: 0.719
  }));
  sampleKit.slot(2).layer(base.with({
    offset: 0.9,
    length: 0.750
  }));
  sampleKit.slot(3).layer(base.with({
    offset: 1.68,
    length: 0.690
  }));
  sampleKit.slot(4).layer(base.with({
    offset: 9.49,
    length: 2
  }));

  var breakKit = bap.sample({
    src: 'sounds/duralcha-funk.wav',
    pitch: -50
  }).slice(16);

  var pattern = bap.pattern({ bars: 2, tempo: 90 });
  pattern.channel(1).add(
    ['1.1.01', 'A1', 96],
    ['1.2.01', 'A1', 96],
    ['1.3.01', 'A2'],
    ['2.1.01', 'A3'],
    ['2.3.01', 'A4', 96 * 2]
  );

  pattern.channel(2).add(
    ['*.odd.01', 'B1'],
    ['*.*.52', 'B2'],
    ['*.2.03', 'B3'],
    ['*.4.03', 'B5'],
    ['2.3.52', 'B4']
  );

  pattern
    .use('A', sampleKit)
    .use('B', breakKit)
    .start();
}

module.exports = slices;
