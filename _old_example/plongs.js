var damu = require('../index');
var kit = module.exports = damu.kit('plongs01');

var defaults = { 'attack': 0.1, 'release': 0.1 };

// passing more than one object to damu.sound will merge
kit.slot(1).layer(damu.sound(defaults, {
  'src': 'sound/plong1.wav',
  'duration': 95
}));
kit.slot(2).layer(damu.sound(defaults, {
  'src': 'sound/plong2.wav',
  'duration': 60
}));
