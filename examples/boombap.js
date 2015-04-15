var bap = require('../index');

function boombap () {
  var drumKit = bap.kit();
  drumKit.slot(1).layer('sounds/kick.wav');
  drumKit.slot(2).layer(bap.sample('sounds/snare.wav'));
  drumKit.slot(3).layer(bap.sample({
    'src': 'sounds/hihat.wav'
  }));

  var drumPattern = bap.pattern({ bars: 2, tempo: 90 });
  drumPattern.channel(1).add(
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

  drumPattern.use('A', drumKit).start();
}

module.exports = boombap;
