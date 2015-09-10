var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');
var numberInRangeType = require('./types/numberInRange');
var memoize = require('lodash.memoize');
var merge = require('lodash.merge');

var prime = null;

var Params = Model.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, {
  type: 'params',

  props: {
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  }
});

Params.mergeSources = memoize(function (_params, sources) {
  var params = Object.assign({}, _params);
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
}, function (params, sources) {
  // var id = '';
  // var source = null;
  // while (sources.length) {
  //   source = sources.shift();
  //   var sourceId = source ? source.cid + ':' + source.revision + '//' : '*//';
  //   id += sourceId;
  // }
  // return id;
  // // return 'foo';
  return sources.map(function (source) {
    return source ? source.cid + '::' + source.revision : '*';
  }).join('//');
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

Params.fromSources = function () {
  prime = prime || new Params();
  var sources = [].slice.call(arguments).reverse();
  console.log(sources.length, sources[2].duration);
  var params = prime.toJSON();
  // params = merge(params, Params.mergeSources(sources));
  console.log(Params.mergeSources({}, sources));
  // params = Object.assign(params, Params.mergeSources(params, sources));
  // prime.vent.trigger('clock:tempo', params);
  // params.length = Params.calculateLength(params);
  // console.log(sources, params.duration, params.length)
  return params;
  // return {};
};

module.exports = Params;
