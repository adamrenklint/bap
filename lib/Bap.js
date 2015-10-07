var Model = require('./Model');
var Clock = require('./Clock');
var LoadingState = require('./LoadingState');
var numberInRangeType = require('./types/numberInRange');

require('./utils/performanceTimePolyfill')();

var Bap = Model.extend({

  type: 'bap',

  children: {
    clock: Clock,
    loadingState: LoadingState
  },

  props: {
    volume: ['volumeRange', true, 100]
  },

  dataTypes: {
    volumeRange: numberInRangeType('volumeRange', 0, 999)
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
  'Sample': require('./Sample'),
  'Reverb': require('./effects/Reverb'),
  'Delay': require('./effects/Delay'),
  'Compressor': require('./effects/Compressor'),
  'Overdrive': require('./effects/Overdrive'),
  'Filter': require('./effects/Filter'),
  'Chorus': require('./effects/Chorus'),
  'Phaser': require('./effects/Phaser')
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
