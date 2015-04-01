var Base = require('./Base');
var inherits = require('util').inherits;

function Damu (options) {

  options = options || {};
  Base.call(this, options);
}

inherits(Damu, Base);

var constructors = {
  'Kit': require('./Kit'),
  'Layer': require('./Layer'),
  'Slot': require('./Slot'),
  'Sound': require('./Sound')
};
Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  Damu.prototype[name] = Ctor;
  Damu.prototype[name.toLowerCase()] = function (options) {
    return new Ctor(options);
  };
});

Damu.prototype.use = function (id, kit) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  if (!(kit instanceof this.Kit)) throw new Error('Invalid kit');

  // ...
}

// use(id, kit)
// get(id) > kit
// has(id) > BOOL
// ids > []
// kits { id: kit, ...}

// clearAll
// clear(id)

// FACTORIES
// kit
// layer
// sound
// slot

// handleStep

module.exports = Damu;
