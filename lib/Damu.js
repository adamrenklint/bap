var Base = require('./Base');
var inherits = require('util').inherits;

function Damu (options) {

  options = options || {};
  Base.call(this, options);

  this._kits = {};
}

inherits(Damu, Base);

// Factories
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
  this._kits[id] = kit;
  // kit.parent = this;
};

Damu.prototype.get = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  return this._kits[id];
};

Damu.prototype.has = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  return !!this._kits[id];
};

Damu.prototype.ids = function () {
  return Object.keys(this._kits);
};

Damu.prototype.kits = function () {
  // TODO: return copy, not reference
  return this._kits;
};

Damu.prototype.clear = function (id) {
  if (!id || typeof id !== 'string') throw new Error('Invalid id');
  if (this.has(id)) {
    // this._slot[id].parent = null;
    this._kits[id] = null;
  }
};

Damu.prototype.clearAll = function () {
  // var self = this;
  // Object.keys(this._kits).forEach(function (id) {
  //   self._kits[id].parent = {};
  // });
  this._kits = {};
};

Damu.prototype.handleStep = function (step) {
  console.log('handleStep', step);
};

module.exports = Damu;
