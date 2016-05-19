require('es6-object-assign').polyfill();

var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');
var numberInRangeType = require('./types/numberInRange');
var bypassable = require('./mixins/bypassable');
var memoize = require('meemo');

var prime = null;

var Params = Model.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, bypassable, {
  type: 'params',

  props: {
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  }
});

Params.mergeSources = memoize(function (params, sources) {
  var multipliers = ['volume'];
  var adders = ['pitch', 'pan'];
  var keys = Object.keys(Params.prototype._definition);

  keys.forEach(function (key) {
    if (key === 'id') { return; }
    sources.forEach(function (source) {
      if (!source) { return; }
      var value = source[key];
      if (~multipliers.indexOf(key)) {
        if (value < 0) { return; }
        if (value === 0) { return params[key] = 0; }
        var multiplier = value / 100;
        params[key] = params[key] !== undefined ? params[key] * multiplier : value;
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
  });

  return params;
}, function (params, sources) {
  var hash = '';
  var keys = Object.keys(Params.prototype._definition);
  var length = keys.length - 1;
  var source, value;

  for (var i = 0, max = sources.length; i < max; i++) {
    source = sources[i];
    if (source) {
      for (var j = 0, maxJ = keys.length; j < maxJ; j++) {
        value = source[keys[j]];
        if (value && keys[j] !== 'id') {
          hash += keys[j] + ':' + value + '/';
        }
      }
    }
    else {
      hash += '*';
    }

    hash += '//';
  }
  return hash;
});

Params.calculateLength = function (params) {
  var existingLength = params.length || 0;
  var lengthFromDuration = params.duration && Params.lengthFromDuration(params, params.duration) || 0;
  if (lengthFromDuration && lengthFromDuration < existingLength || !existingLength) {
    params.hasLengthFromDuration = true;
    return lengthFromDuration;
  }
  else {
    return existingLength;
  }
};

Params.lengthFromDuration = function (params, duration) {
  var secondsPerBeat = 60 / params.tempo;
  var secondsPerTick = secondsPerBeat / 96;
  return duration * secondsPerTick;
};

Params.correctAttackAndRelease = function (params) {
  var total = params.attack + params.release;
  if (params.length && total > params.length) {
    params.attack = (params.length / total) * params.attack;
    params.release = (params.length / total) * params.release;
  }
};

Params.fromSources = function (sources) {
  prime = prime || new Params();
  var params = prime.toJSON();
  params = Object.assign({}, Params.mergeSources(params, sources.reverse()));
  prime.vent.trigger('clock:tempo', params);
  params.length = Params.calculateLength(params);
  Params.correctAttackAndRelease(params);
  return params;
};

module.exports = Params;
