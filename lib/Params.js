var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');
var numberInRangeType = require('./types/numberInRange');
var memoize = require('lodash.memoize');

// var nodes = [];
// var count = 0;
// function pool(node) {
//   if (node) {
//     // console.log('realloc');
//     nodes.push(node);
//   }
//   else if (nodes.length) {
//     // console.log('reuse');
//     return nodes.shift();
//   }
//   else {
//     console.log('alloc params', ++count);
//     return new Params();
//     // return context[factoryName]();
//   }
// }

var prime = null;


/*

  so a pool might not be the best idea...

  instead, create one default param and get all the defaults from that
  then merge all new params on top of that
  and always deliver a raw json


  ---- OR

  just find a smart way to reset it to the defaults, without triggering change events

*/


var Params = Model.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, {
  type: 'params',

  props: {
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  // initialize: function () {
  //   Model.prototype.initialize.apply(this, arguments);
  //   // this.vent.trigger('clock:tempo', this);
  //   // this.length = this._calculateLength();
  // },

  alloc: function (params) {
    this.set(params);
    this.vent.trigger('clock:tempo', this);
    this.length = this._calculateLength();
  },

  dealloc: function () {
    pool(this);
  },


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
      json[key] = source && source[key];
    });
    return JSON.stringify(json);
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
  var params = prime.toJSON();
  var merged = Params.mergeSources(sources);
  Object.assign(params, merged);
  prime.vent.trigger('clock:tempo', params);
  params.length = Params.calculateLength(params);
  return params;
};

module.exports = Params;
