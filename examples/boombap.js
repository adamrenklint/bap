var bap = require('../index');

function boombap () {
  var drumkit = bap.kit();
  drumkit.slot(1).layer('sounds/kick.wav');
  drumkit.slot(2).layer(bap.sample('sounds/snare.wav'));
  drumkit.slot(3).layer(bap.sample({
    'src': 'sounds/hihat.wav'
  }));
}

module.exports = boombap;
