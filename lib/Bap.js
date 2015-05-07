var Model = require('./Model');
var Clock = require('./Clock');
var LoadingState = require('./LoadingState');

var Bap = Model.extend({

  type: 'bap',

  children: {
    clock: Clock,
    loadingState: LoadingState
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.vent.bap = this;
    this.on('change:loadingState.loading', this._onChangeLoadingState);
  },

  _onChangeLoadingState: function () {
    this.vent.loading = this.loadingState.loading;
  }
});

var constructors = {
  'Kit': require('./Kit'),
  'Slot': require('./Slot'),
  'Layer': require('./Layer'),
  'Pattern': require('./Pattern'),
  'Sequence': require('./Sequence'),
  'Channel': require('./Channel'),
  'Note': require('./Note'),
  'Oscillator': require('./Oscillator'),
  'Sample': require('./Sample')
};

function applyToConstructor (constructor, argArray) {
  var args = [null].concat(argArray);
  var factoryFunction = constructor.bind.apply(constructor, args);
  return new factoryFunction();
}

Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  Bap.prototype[name] = Ctor;
  Bap.prototype[name.toLowerCase()] = function () {
    return applyToConstructor(Ctor, [].slice.call(arguments));
  };
});

module.exports = Bap;
