require('es6-object-assign').polyfill();

const Model = require('./Model');
const triggerParams = require('./mixins/triggerParams');
const volumeParams = require('./mixins/volumeParams');
const oscillatorParams = require('./mixins/oscillatorParams');
const sampleParams = require('./mixins/sampleParams');
const numberInRangeType = require('./types/numberInRange');
const bypassable = require('./mixins/bypassable');
const memoize = require('meemo');

let prime = null;

const Params = Model.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, bypassable, {
  type: 'params',

  props: {
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  }
});

Params.mergeSources = memoize((params, sources) => {
  const multipliers = ['volume'];
  const adders = ['pitch', 'pan'];
  const keys = Object.keys(Params.prototype._definition);

  keys.forEach(key => {
    if (key === 'id') { return; }
    sources.forEach(source => {
      if (!source) { return; }
      let value = source[key];
      if (~multipliers.indexOf(key)) {
        if (value < 0) { return; }
        if (value === 0) {
          params[key] = 0;
          return;
        }
        const multiplier = value / 100;
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
}, (params, sources) => {
  let hash = '';
  const keys = Object.keys(Params.prototype._definition);
  const length = keys.length - 1;
  let source, value;

  for (let i = 0, max = sources.length; i < max; i++) {
    source = sources[i];
    if (source) {
      for (let j = 0, maxJ = keys.length; j < maxJ; j++) {
        value = source[keys[j]];
        if (value && keys[j] !== 'id') {
          hash += `${keys[j]}:${value}/`;
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

Params.calculateLength = params => {
  const existingLength = params.length || 0;
  const lengthFromDuration = params.duration && Params.lengthFromDuration(params, params.duration) || 0;
  if (lengthFromDuration && lengthFromDuration < existingLength || !existingLength) {
    params.hasLengthFromDuration = true;
    return lengthFromDuration;
  }
  else {
    return existingLength;
  }
};

Params.lengthFromDuration = ({tempo}, duration) => {
  const secondsPerBeat = 60 / tempo;
  const secondsPerTick = secondsPerBeat / 96;
  return duration * secondsPerTick;
};

Params.correctAttackAndRelease = params => {
  const total = params.attack + params.release;
  if (params.length && total > params.length) {
    params.attack = (params.length / total) * params.attack;
    params.release = (params.length / total) * params.release;
  }
};

Params.fromSources = sources => {
  prime = prime || new Params();
  let params = prime.toJSON();
  params = Object.assign({}, Params.mergeSources(params, sources.reverse()));
  prime.vent.trigger('clock:tempo', params);
  params.length = Params.calculateLength(params);
  Params.correctAttackAndRelease(params);
  return params;
};

module.exports = Params;
