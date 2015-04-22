var bap = require('../index');

function slices () {
  var sampleKit = bap.kit();
  var base = bap.sample({
    src: 'sounds/slices.wav',
    attack: 0.01,
    release: 0.01,
    channel: 'left'
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
    src: 'sounds/esther.wav',
    pitch: -26
  }).slice(16);
  breakKit.slot(1).layer('sounds/kick.wav');
  breakKit.slot(2).layer('sounds/snare.wav');
  breakKit.slot(4).layer('sounds/snare.wav');

  var pattern = bap.pattern({ bars: 2, tempo: 95 });
  pattern.channel(1).add(
    ['1.1.01', 'A1', 96],
    ['1.2.01', 'A1', 96],
    ['1.3.01', 'A2'],
    ['2.1.01', 'A3'],
    ['2.2.80', 'A4', (96 * 2) + 16 ]
  );

  pattern.channel(2).add(
    ['1.1.01', 'B1'],
    ['1.2.01', 'B2'],
    ['1.3.01', 'B3'],
    ['1.4.01', 'B4'],
    ['2.1.01', 'B1'],
    ['2.2.01', 'B2'],
    ['2.3.01', 'B8'],
    ['2.4.01', 'B9'],
    ['2.4.49', 'B5', 48]
  );

  pattern
    .kit('A', sampleKit)
    // .kit('B', breakKit)
    .start();
}

module.exports = slices;
