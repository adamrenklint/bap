var Base = require('./Base');
var Clock = require('./Clock');

var Bap = Base.extend({

  initialize: function (state, options) {
    Base.prototype.initialize.apply(this, arguments);

    this.clock = new Clock();
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
