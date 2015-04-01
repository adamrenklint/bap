var damu = require('../index');
var kit = module.exports = damu.kit('strings01');

var defaults = { 'attack': 0.1, 'release': 0.1 };

kit.slot(1).layer(damu.sound(defaults, {
  'src': 'sound/strings1.wav',
  'duration': 90
}));
kit.slot(2).layer(damu.sound(defaults, {
  'src': 'sound/strings2.wav',
  'duration': 70
}));
kit.slot(3).layer(damu.sound(defaults, {
  'src': 'sound/strings3.wav',
  'duration': 45
}));
