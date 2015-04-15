var Model = require('./Model');
var Clock = require('./Clock');

var Bap = Model.extend({
  type: 'bap',
  children: {
    clock: Clock
  }
});

var constructors = {
  'kit': require('./Kit'),
  'slot': require('./Slot'),
  'layer': require('./Layer'),
  'pattern': require('./Pattern'),
  'channel': require('./Channel'),
  'note': require('./Note'),
  'oscillator': require('./Oscillator'),
  'sample': require('./Sample')
};

Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  if (typeof Ctor === 'function') {
    Bap.prototype[name] = function (state, options) {
      return new Ctor(state, options);
    };
  }
});

module.exports = Bap;
