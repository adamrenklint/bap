var bap = require('../index');

function sequences () {

  bap.clock.tempo = 120;

  var lowPianoKit = bap.sample({
    src: 'sounds/own_barricade_end.wav',
    attack: 0.1,
    release: 0.1,
    pitch: -40,
    pan: 40
  }).slice(8);

  var piano1 = bap.pattern({ tempo: 84, bars: 2 });
  piano1.kit(1, lowPianoKit).channel(1).add(
    ['1.odd.01',  '1E', 96],
    ['1.even.01', '1R', 96],
    ['2.1.01',    '1E', 96],
    ['2.2.01',    '1R', 96],
    ['2.3.01',    '1Q', 96],
    ['2.4.01',    '1W', 96]
  );

  var introPiano = bap.pattern({ tempo: 120, bars: 4 });
  introPiano.kit(1, lowPianoKit).channel(1).add(
    ['*.1.01', '1E', 192, null, -40],
    ['*.3.01', '1R', 192, null, -40],
    ['4.3.25', '1W', 192, null, -40]
  );

  var otherPianoKit = bap.sample({
    src: 'sounds/own_barricade_middle.wav',
    attack: 0.3,
    release: 0.1,
    pitch: -40,
    pan: -40,
    volume: 150
  }).slice(5);

  var otherPianoPattern = bap.pattern({ bars: 2 }).kit(2, otherPianoKit);
  otherPianoPattern.channel(1).add(
    ['1.*.52', '2W', 48],
    ['1.1.01', '2Q', 52],
    ['2.*.48', '2R', 48]
  );

  var drumKit = bap.kit();
  drumKit.slot('Q').layer('sounds/kick.wav');
  drumKit.slot('W').layer('sounds/snare_1.wav').layer(bap.sample({
    src: 'sounds/snare_38.wav',
    volume: 40
  }));
  drumKit.slot('E').layer(bap.sample({
    src: 'sounds/hihat.wav',
    volume: 20
  }));

  var drumPattern = bap.pattern({ bars: 2 }).kit(1, drumKit);
  drumPattern.channel(1).add(
    ['*.1.01',   '1Q'],
    ['*.3.52',   '1Q'],
    ['2.*.35',   '1E', null, 30],
    ['*.odd.92', '1W'],
    ['*.*.%52',  '1E']
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
    .kit(1, breakKit)
    .kit(2, smallBreakKit);

  breakPattern.channel(1).add(
    ['*.1.01', '1Q', 96],
    ['*.1.93', '1W', 100],
    ['1.3.01', '2I', 48],
    ['1.3.52', '1Q', 48],
    ['1.3.94', '1W', 100],
    ['2.3.01', '1E', 96],
    ['2.4.01', '1R', 96]
  );

  var mainLoop = bap.sequence(
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, drumPattern, breakPattern],
    [piano1, otherPianoPattern, breakPattern]
  );

  var arrangedBeat = bap.sequence(
    introPiano,
    mainLoop,
    mainLoop,
    mainLoop,
    mainLoop
  );

  arrangedBeat.start();
}

module.exports = sequences;
