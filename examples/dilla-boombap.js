var bap = require('../index');

function boombap () {
  var drumKit = bap.kit();
  // three ways to add a sample layer to a slot
  drumKit.slot(1).layer('sounds/kick.wav');
  var snare = bap.sample('sounds/snare.wav');
  drumKit.slot(2).layer(snare);
  drumKit.slot(3).layer(bap.sample({
    src: 'sounds/hihat.wav',
    volume: 50
  }));

  var plongKit = bap.kit();
  plongKit.slot(1).layer(bap.sample({
    src: 'sounds/plong1.wav',
    duration: 95
  }));
  plongKit.slot(2).layer(bap.sample({
    src: 'sounds/plong2.wav',
    duration: 60
  }));

  var stringKit = bap.kit();
  stringKit.slot(1).layer(bap.sample({
    src: 'sounds/string1.wav',
    duration: 90
  }));
  stringKit.slot(2).layer(bap.sample({
    src: 'sounds/string2.wav',
    duration: 70
  }));
  stringKit.slot(3).layer(bap.sample({
    src: 'sounds/string3.wav',
    duration: 45
  }));

  var bassKit = bap.kit();
  bassKit.slot(1).layer(bap.sample({
    src: 'sounds/bass.wav',
    attack: 0.01,
    release: 0.01
  }));

  var boombapPattern = bap.pattern({ bars: 2, tempo: 90 });
  boombapPattern.channel(1).add(
    ['1.1.01', 'A01'],
    ['1.1.51', 'A01', null, 80],
    ['1.1.91', 'A02'],
    ['1.2.88', 'A01'],
    ['1.3.75', 'A01'],
    ['1.3.91', 'A02'],
    ['1.4.72', 'A01', null, 80],
    ['2.1.91', 'A02'],
    ['2.1.51', 'A01', null, 70],
    ['2.3.51', 'A01', null, 80],
    ['2.3.88', 'A01'],
    ['2.4.03', 'A02']
  );

  boombapPattern.channel(2).add(
    ['*.odd.01', 'A03', null, 70],
    ['*.even.01', 'A03', null, 80],
    ['*.4.53', 'A03', null, 60]
  );

  boombapPattern.channel(3).add(
    ['1.1.01', 'B01'],
    ['1.4.90', 'B02', null, 40],
    ['2.1.52', 'B02', null, 70]
  );

  boombapPattern.channel(4).add(
    ['1.2.05', 'C03', null, 60],
    ['1.2.51', 'C03', null, 40],
    ['1.3.05', 'C03', null, 20],
    ['1.3.51', 'C03', null, 5],
    ['1.3.75', 'C01', null, 60],
    ['1.4.52', 'C01', null, 20],
    ['2.2.05', 'C03', null, 60],
    ['2.2.50', 'C02', null, 60],
    ['2.3.25', 'C01', 70, 60],
    ['2.4.01', 'C01', 85, 30],
    ['2.4.75', 'C01', 85, 10]
  );

  boombapPattern.channel(5).add(
    ['1.1.01', 'D01', 60, 80, -90],
    ['1.2.72', 'D01', 15, 50, -90],
    ['1.3.02', 'D01', 40, 80, -90],
    ['1.4.01', 'D01', 40, 60, -72],
    ['1.4.51', 'D01', 100, 80, -52],
    ['2.3.51', 'D01', 60, 80, -116],
    ['2.4.51', 'D01', 40, 80, -96]
  );

  boombapPattern
    .use('A', drumKit)
    .use('B', plongKit)
    .use('C', stringKit)
    .use('D', bassKit)
    .start();
}

module.exports = boombap;
