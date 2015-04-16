var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');
var numberInRangeType = require('./types/numberInRange');

var Params = Model.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, {
  type: 'params',

  props: {
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.vent.trigger('clock:tempo', this);
    this.length = this.length || this.duration && this.lengthFromDuration(this.duration) || 0;
  },

  lengthFromDuration: function (duration) {
    var secondsPerBeat = 60 / this.tempo;
    var secondsPerTick = secondsPerBeat / 96;
    return duration * secondsPerTick;
  }
});

Params.fromSources = function () {
  var sources = [].slice.call(arguments).reverse();
  var params = {};

  var multipliers = ['volume'];
  var adders = ['pitch', 'pan'];
  var keys = Object.keys(Params.prototype._definition);

  keys.forEach(function (key) {
    if (key === 'id') { return; }
    sources.forEach(function (source) {
      if (!source) { return; }
      var value = source[key];
      if (~multipliers.indexOf(key)) {
        if (!value || value < 0) { return; }
        var multiplier = value / 100;
        params[key] = params[key] ? params[key] * multiplier : value;
      }
      else if (~adders.indexOf(key)) {
        value = value || 0;
        params[key] = (params[key] || 0) + value;
      }
      else {
        params[key] = value || params[key];
      }
    });

    if (key === 'pan' && params[key] < -100) {
      params[key] = -100;
    }
    else if (key === 'pan' && params[key] > 100) {
      params[key] = 100;
    }
    else if (typeof params[key] === 'undefined') {
      delete params[key];
    }
  });

  return new Params(params);
};

module.exports = Params;
