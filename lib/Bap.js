var Base = require('./Base');
var inherits = require('util').inherits;

function Bap (params) {

  Base.call(this, params);

  //this.params

  // this.context = options.context || context;
  // this.clock = options.clock || new Clock();
}

inherits(Bap, Base);

var constructors = {
  'Pattern': require('./Pattern')
};
Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  Bap.prototype[name] = Ctor;
  Bap.prototype[name.toLowerCase()] = function (params) {
    // params = params || {};
    // options.clock = this.clock;
    return new Ctor(params);
  };
});

module.exports = Bap;
