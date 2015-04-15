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
    this.on('change:loadingState.loading', this.onChangeLoadingState);
    this.listenTo(this.vent, 'loadingState:add', this.loadingState.addSource.bind(this.loadingState));
    this.listenTo(this.vent, 'loadingState:remove', this.loadingState.removeSource.bind(this.loadingState));
  },

  onChangeLoadingState: function () {
    this.vent.loading = this.loadingState.loading;
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
