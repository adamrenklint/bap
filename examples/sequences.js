var bap = require('../index');

function sequences () {

  var lowPianoKit = bap.sample({
    src: 'sounds/new/own_barricade_end.wav',
    attack: 0.1,
    release: 0.1,
    pitch: -40,
    pan: 25
  }).slice(8);

  var piano1 = bap.pattern({ tempo: 84, bars: 2 });
  piano1.kit('A', lowPianoKit).channel(1).add(
    ['1.odd.01', 'A3', 96],
    ['1.even.01', 'A4', 96],
    ['2.1.01', 'A3', 96],
    ['2.2.01', 'A4', 96],
    ['2.3.01', 'A1', 96],
    ['2.4.01', 'A2', 96]
  );

  var otherPianoKit = bap.sample({
    src: 'sounds/new/own_barricade_middle.wav',
    attack: 0.3,
    release: 0.1,
    pitch: -40,
    pan: -25,
    volume: 150
  }).slice(5);

  var otherPianoPattern = bap.pattern({ bars: 2 }).kit('B', otherPianoKit);
  otherPianoPattern.channel(1).add(
    ['1.*.52', 'B2', 48],
    ['1.1.01', 'B1', 52],
    ['2.*.48', 'B4', 48]
  );

  var bassKit = bap.kit();
  bassKit.slot(1).layer(bap.sample({
    src: 'sounds/new/Sample25.WAV',
    channel: 'left'
  }));

  var bassPattern = bap.pattern().kit('A', bassKit);
  bassPattern.channel(1).add(
    // ['2.3.01', 'A1']
  );

  var drumKit = bap.kit();
  drumKit.slot(1).layer('sounds/kick.wav');
  drumKit.slot(2).layer('sounds/new/SNARE1.WAV').layer(bap.sample({
    src: 'sounds/new/SNARE_38.WAV',
    volume: 40
  }));
  drumKit.slot(3).layer(bap.sample({
    src: 'sounds/hihat.wav',
    volume: 20
  }));

  var drumPattern = bap.pattern({ bars: 2 }).kit('X', drumKit);
  drumPattern.channel(1).add(
    ['*.1.01', 'X1'],
    ['*.3.52', 'X1'],
    ['*.odd.92', 'X2'],
    ['*.*.%52', 'X3']
  );

  var breakSample = bap.sample({
    src: 'sounds/esther.wav',
    pitch: -48,
    volume: 30,
    channel: 'right'
  });
  var breakKit = breakSample.slice(16);
  var smallBreakKit = breakSample.slice(32);

  var breakPattern = bap.pattern({ tempo: 84, bars: 2 })
    .kit('A', breakKit)
    .kit('B', smallBreakKit);
  breakPattern.channel(1).add(
    ['*.1.01', 'A1', 96],
    ['*.1.93', 'A2', 100],
    ['1.3.01', 'B8', 48],
    ['1.3.52', 'A1', 48],
    ['1.3.94', 'A2', 100],
    ['2.3.01', 'A3', 96],
    ['2.4.01', 'A4', 96]
  );

  var y = bap.sequence(
    // [piano1, drumPattern],
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, breakPattern],
    { loop: true }
  );

  var z = bap.sequence(
    [y,y],
    [y,y],
    { loop: true }
  )

  var x = bap.sequence(
    y,z,y,z,y,z,y,z,y,z,y,
    { loop: true }
  )
  x.start();
  // breakPattern.start();
}

module.exports = sequences;
