var damu = require('../index');
var kit = module.exports = damu.kit('drumkit01');

// three different ways of adding a oneshot sample as single layer
kit.slot(1).layer('sounds/kick.wav');
kit.slot(2).layer(damu.sound('sounds/snare.wav'));
kit.slot(3).layer(damu.sound({
  'src': 'sounds/hihat.wav'
}));
