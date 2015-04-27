var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');
var numberInRangeType = require('./types/numberInRange');
var memoize = require('lodash.memoize');

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
    this.length = this._calculateLength();
  },

  _calculateLength: function () {
    var existingLength = this.length || 0;
    var lengthFromDuration = this.duration && this._lengthFromDuration(this.duration) || 0;
    if (lengthFromDuration && lengthFromDuration < existingLength || !existingLength) {
      this.hasLengthFromDuration = true;
      return lengthFromDuration;
    }
    else {
      return existingLength;
    }
  },

  _lengthFromDuration: function (duration) {
    var secondsPerBeat = 60 / this.tempo;
    var secondsPerTick = secondsPerBeat / 96;
    return duration * secondsPerTick;
  }
});

Params.mergeSources = memoize(function (sources) {
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

  return params;
}, function (sources) {
  var keys = Object.keys(Params.prototype._definition);
  return sources.map(function (source) {
    var json = {};
    keys.forEach(function (key) {
      json[key] = source[key];
    });
    return JSON.stringify(json);
  }).join('//');
});

Params.fromSources = function () {
  var sources = [].slice.call(arguments).reverse();
  var params = Params.mergeSources(sources);
  return new Params(params);
};

module.exports = Params;
