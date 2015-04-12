var Model = require('./Model');
var Clock = require('./Clock');

var Bap = Model.extend({
  children: {
    clock: Clock
  }
});

var constructors = {
  'pattern': require('./Pattern'),
  'kit': require('./Kit'),
  'note': require('./Note')
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
