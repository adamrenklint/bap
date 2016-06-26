var bap = require('../index');

function boombap () {
  var drumKit = bap.kit();
  var drumCompressor = bap.compressor({
    threshold: -12,
    gain: 110
  });

  // three ways to add a sample layer to a slot
  drumKit.slot('Q').layer('sounds/kick.wav');
  drumKit.slot('Q').connect(drumCompressor);
  var snare = bap.sample('sounds/snare.wav');
  drumKit.slot('W').layer(snare);
  drumKit.slot('W').connect(drumCompressor);
  drumKit.slot('W').connect(bap.reverb({
    filter: 'notch',
    cutoff: 1000,
    wet: 5,
    dry: 80
  }));
  drumKit.slot('E').layer(bap.sample({
    src: 'sounds/hihat.wav',
    volume: 50
  }));
  drumKit.slot('E').connect(bap.reverb({
    wet: 5,
    dry: 70,
    time: 0.5,
    cutoff: 5000
  }));

  var plongKit = bap.kit({
    volume: 90
  });
  plongKit.connect(bap.delay({
    filter: 'highshelf',
    time: 0.5,
    sync: true,
    feedback: 30,
    cutoff: 5000,
    wet: 10
  }));
  plongKit.slot('Q').layer(bap.sample({
    src: 'sounds/plong1.wav',
    duration: 95
  }));
  plongKit.slot('W').layer(bap.sample({
    src: 'sounds/plong2.wav',
    duration: 60
  }));

  var stringKit = bap.kit({
    volume: 90
  });
  stringKit.connect(bap.reverb({
    wet: 5,
    dry: 90,
    cutoff: 2500
  }));
  stringKit.slot('Q').layer(bap.sample({
    src: 'sounds/string1.wav',
    duration: 90
  }));
  stringKit.slot('W').layer(bap.sample({
    src: 'sounds/string2.wav',
    duration: 70
  }));
  stringKit.slot('E').layer(bap.sample({
    src: 'sounds/string3.wav',
    duration: 45
  }));

  var bassKit = bap.kit();
  bassKit.slot('Q').layer(bap.sample({
    src: 'sounds/bass.wav',
    attack: 0.01,
    release: 0.05
  }));
  var overdrive = bap.overdrive({ dry: 110, wet: 40, gain: 60 });
  bassKit.connect(overdrive);

  var boombapPattern = bap.pattern({ bars: 2, tempo: 90 });
  boombapPattern.channel(1).add(
    ['1.1.01', '1Q'],
    ['1.1.51', '1Q', null, 80],
    ['1.1.91', '1W'],
    ['1.2.88', '1Q'],
    ['1.3.75', '1Q'],
    ['1.3.91', '1W'],
    ['1.4.72', '1Q', null, 80],
    ['2.1.91', '1W'],
    ['2.1.51', '1Q', null, 70],
    ['2.3.51', '1Q', null, 80],
    ['2.3.88', '1Q'],
    ['2.4.03', '1W']
  );

  boombapPattern.channel(2).add(
    ['*.odd.01',  '1E', null, 70],
    ['*.even.01', '1E', null, 80],
    ['*.4.53',    '1E', null, 60]
  );

  boombapPattern.channel(3).add(
    ['1.1.01', '2Q'],
    ['1.4.90', '2W', null, 40],
    ['2.1.52', '2W', null, 70]
  );

  boombapPattern.channel(4).add(
    ['1.2.05', '3E', null, 60],
    ['1.2.51', '3E', null, 40],
    ['1.3.05', '3E', null, 20],
    ['1.3.51', '3E', null, 5],
    ['1.3.75', '3Q', null, 60],
    ['1.4.52', '3Q', null, 20],
    ['2.2.05', '3E', null, 60],
    ['2.2.50', '3W', null, 60],
    ['2.3.25', '3Q', 70, 60],
    ['2.4.01', '3Q', 85, 30],
    ['2.4.75', '3Q', 85, 10]
  );

  boombapPattern.channel(5).add(
    ['1.1.01', '4Q', 60, 80, -10.34],
    ['1.2.72', '4Q', 15, 50, -10.34],
    ['1.3.02', '4Q', 40, 80, -10.34],
    ['1.4.01', '4Q', 40, 60, -7.7],
    ['1.4.51', '4Q', 96, 80, -5.2],
    ['2.3.51', '4Q', 60, 80, -13.43],
    ['2.4.51', '4Q', 40, 80, -11.3]
  );

  bap.clock.sequence = boombapPattern
    .kit(1, drumKit)
    .kit(2, plongKit)
    .kit(3, stringKit)
    .kit(4, bassKit);
}

module.exports = boombap;
