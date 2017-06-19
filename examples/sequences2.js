var bap = require('../index');

function sequences () {

  var lowPianoKit = bap.sample({
    src: 'sounds/own_barricade_end.wav',
    attack: 0.01,
    release: 0.01,
    pitch: -4,
    pan: 40
  }).connect(bap.filter({ shape: 'highpass', dry: 80, wet: 40 })).slice(8);

  var lead = bap.pattern({ tempo: 84, bars: 2 });
  lead.kit(1, lowPianoKit).channel(1).add(
    ['1.odd.01',  '1E', 96],
    ['1.even.01', '1R', 96],
    ['2.1.01',    '1E', 96],
    ['2.2.01',    '1R', 96],
    ['2.3.01',    '1Q', 96],
    ['2.4.01',    '1W', 96]
  );

  var drumKit = bap.kit();
  drumKit.slot('Q').layer(bap.sample({
    src: 'sounds/kick.wav',
    bitcrush: 12
  }));
  drumKit.slot('W').layer('sounds/snare_1.wav').layer(bap.sample({
    src: 'sounds/snare_38.wav',
    bitcrush: 12,
    volume: 40
  }));
  drumKit.slot('E').layer(bap.sample({
    src: 'sounds/hihat.wav',
    bitcrush: 12,
    volume: 20
  }));
  drumKit.connect(bap.filter({ shape: 'lowpass', wet: 40, dry: 80 }));

  var drums = bap.pattern({ bars: 2 }).kit(1, drumKit);
  drums.channel(1).add(
    ['1.1.01',   '1Q'],
    ['1.3.52',   '1Q'],
    ['1.*.35',   '1E', null, 30],
    ['1.odd.92', '1W'],
    ['1.*.%52',  '1E']
  );

  bap.clock.sequence = bap.sequence([drums, lead], { loop: true });
}

module.exports = sequences;
