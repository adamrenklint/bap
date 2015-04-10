var Base = require('./Base');
var inherits = require('util').inherits;
console.log(require('util'))

function Bap (options) {

  options = options || {};
  Base.call(this, options);

  this._kits = {};
}

inherits(Bap, Base);

// Factories
var constructors = {
  'Kit': require('./Kit'),
  'Layer': require('./Layer'),
  'Slot': require('./Slot'),
  'Sound': require('./Sound')
};
Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  Bap.prototype[name] = Ctor;
  Bap.prototype[name.toLowerCase()] = function (options) {
    return new Ctor(options);
  };
});

Bap.prototype.use = function (id, kit) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  if (!(kit instanceof this.Kit)) throw new Error('Invalid kit');
  this._kits[id] = kit;
  // kit.parent = this;
};

Bap.prototype.get = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  return this._kits[id];
};

Bap.prototype.has = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  return !!this._kits[id];
};

Bap.prototype.ids = function () {
  return Object.keys(this._kits);
};

Bap.prototype.kits = function () {
  // TODO: return copy, not reference
  return this._kits;
};

Bap.prototype.clear = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  if (this.has(id)) {
    // this._slot[id].parent = null;
    this._kits[id] = null;
  }
};

Bap.prototype.clearAll = function () {
  // var self = this;
  // Object.keys(this._kits).forEach(function (id) {
  //   self._kits[id].parent = {};
  // });
  this._kits = {};
};

Bap.prototype.handleStep = function (step) {
  console.log('handleStep', step);
};

module.exports = Bap;
