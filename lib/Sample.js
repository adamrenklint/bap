var Layer = require('./Layer');
var Kit = require('./Kit');
var Params = require('./Params');
var sampleParams = require('./mixins/sampleParams');
var memoize = require('meemo');
var uniqueId = require('./utils/uniqueId');
var utils = require('audio-buffer-utils');
var slotIds = 'QWERTYUIOPASDFGHJKLZXCVBNM';

var buffers = {};
var loading = {};

var Sample = Layer.extend({

  type: 'sample',

  props: {
    loaded: ['boolean', true, false],
    sliceExpression: 'string',
    buffer: 'any'
  },

  constructor: function (src, params, options) {
    if (typeof src === 'string') {
      params = params || {};
      params.src = src;
    }
    else {
      options = params;
      params = src;
    }
    Layer.call(this, params, options);
  },

  initialize: function (src, options) {
    Layer.prototype.initialize.call(this, src, options);
    this.on('change:src', this._loadSample);
    this.on('change:loaded', this._configureSlice);
    this.on('change:sliceExpression', this._configureSlice);
    this.src && this._loadSample();
    this._configureSlice();
  },

  _getSlotId: function (index) {
    if (index < slotIds.length) {
      return slotIds[index];
    }
    else {
      var cycles = Math.floor(index / slotIds.length);
      index -= (cycles * slotIds.length);
      return slotIds[cycles - 1] + slotIds[index];
    }
  },

  slice: function (pieces) {
    // not clean, but I'm not sure of another way of solving this circular dependency
    var kit = new this.vent.bap.kit();
    for (var i = 0; i < pieces; i++) {
      kit.slot(this._getSlotId(i)).layer(this.with({
        sliceExpression: '' + (i + 1) + '/' + pieces
      }));
    }
    return kit;
  },

  _params: function () {
    var params = Layer.prototype._params.apply(this, arguments);

    params.length = params.length || this.buffer && (this.buffer.duration - params.offset) || 0;
    if (params.reverse && params.offset) {
      var offset = this.buffer.duration - (params.offset + params.length);
      if (offset > 0) params.offset = offset;
    }

    var playbackRate = params.playbackRate = this._getPlaybackRate(params);

    if (!params.hasLengthFromDuration) {
      var adjustedLength = params.length / playbackRate;
      var durationLength = params.duration && Params.lengthFromDuration(params, params.duration);

      if (durationLength && durationLength < adjustedLength) {
        params.length = durationLength;
      }
      else {
        params.length = adjustedLength;
      }
    }

    return params;
  },

  _startSource: function (time, params, source) {
    source.start(time, params.offset || 0);
  },

  _source: function (params) {
    if (!this.src) {
      throw new Error('Cannot start sample without source url');
    }
    if (!this.buffer) {
      throw new Error('Cannot start sample without loaded buffer');
    }

    var source = this.context.createBufferSource();
    source.buffer = Sample.makeBuffer(params, this.buffer, this.context);

    source.playbackRate.value = params.playbackRate;

    if (params.loop > 0) {
      source.loop = true;
      source.loopStart = params.offset;
      source.loopEnd = params.offset + params.loop;
    }

    return source;
  },

  _getStopTime: function (time, params, source) {
    return time + source.buffer.duration;
  },

  _getPlaybackRate: function (params) {
    if (params.pitch < 0) {
      var mod = -params.pitch / 100;
      var full = Math.floor(mod);
      var rest = mod - full;
      var rate = Math.pow(0.5, full);
      return rate * (1 - (rest * 0.5));
    }
    else {
      return (params.pitch / 100) + 1;
    }
  },

  _loadSample: function (countLoading) {
    var buffer = buffers[this.src];
    if (!buffer) {
      this.loaded = false;

      if (loading[this.src]) {
        if (countLoading !== false) {
          loading[this.src]++;
        }
        return setTimeout(this._loadSample.bind(this, false), 10);
      }

      this.vent.trigger('loadingState:add', this.src);
      loading[this.src] = 1;

      var request = new XMLHttpRequest();
      request.open('GET', this.src, true);
      request.responseType = 'arraybuffer';
      request.onload = function soundWasLoaded () {
        this.context.decodeAudioData(request.response, function (buffer) {
          buffer.uid = uniqueId('buffer');
          this.buffer = buffers[this.src] = buffer;
          loading[this.src]--;
          this.loaded = true;
          if (!loading[this.src]) {
            this.vent.trigger('loadingState:remove', this.src);
          }
          request.onload = null;
        }.bind(this));
      }.bind(this);
      request.send();
    }
    else {
      this.buffer = buffer;
      loading[this.src]--;
      this.loaded = true;
      if (!loading[this.src]) {
        this.vent.trigger('loadingState:remove', this.src);
      }
    }
  },

  _configureRelease: function (time, params, gain) {
    if (params.trimToZeroCrossingPoint) {
      time -= Sample.silentTailSamples / 44100;
    }
    Layer.prototype._configureRelease.call(this, time, params, gain);
  },

  _configureSlice: function () {
    if (this.buffer && this.loaded && this.sliceExpression) {
      var length = this.buffer.duration;
      var parts = this.sliceExpression.split('/');
      var index = parseInt(parts[0], 10) - 1;
      var total = parseInt(parts[1], 10);
      var sliceLength = length / total;
      var offset = index * sliceLength;

      this.length = sliceLength;
      this.offset = offset;
    }
  }
}, sampleParams);

// http://noisehack.com/custom-audio-effects-javascript-web-audio-api/
Sample.bitcrush = function (params, buffer, context) {

  if (!params.bitcrush) {
    return buffer;
  }

  var bits = params.bitcrush;
  var normfreq = (params.bitcrushFrequency - 20) / 22030;
  var mix = (params.bitcrushMix || 50) / 100;
  var step = Math.pow(1/2, bits);
  var phaser = 0;
  var last = 0;

  var newBuffer = context.createBuffer(1, buffer.length, buffer.sampleRate);
  var input = buffer.getChannelData(0);
  var output = newBuffer.getChannelData(0);

  for (var i = 0; i < buffer.length; i++) {
      phaser += normfreq;
      if (phaser >= 1.0) {
          phaser -= 1.0;
          last = step * Math.floor(input[i] / step + 0.5);
      }
      output[i] = last;

      if (mix !== 1) {
        var wet = output[i] * mix;
        var dry = input[i] * (1 - mix);
        output[i] = wet + dry;
      }
  }

  return newBuffer;
};

Sample.silentTailSize = 250;

Sample.cutBufferToLength = function (buffer, length, context) {

  var numberOfChannels = buffer.numberOfChannels;
  var sampleRate = buffer.sampleRate;
  var tailSamples = Sample.silentTailSamples;
  // add include 250 extra sample frames that will be made silent
  var target = Math.floor(length * sampleRate) + tailSamples;
  var newBuffer = context.createBuffer(numberOfChannels, target, sampleRate);
  var index, data, chunk, lastChunk, didFindEnd;
  var dismissed = 0;

  for (var i = 0; i < numberOfChannels; i++) {
    index = target;
    didFindEnd = false;
    data = buffer.getChannelData(i);
    newData = newBuffer.getChannelData(i);

    while (index > -1) {
      chunk = data[index];
      if (!didFindEnd) {
        if (dismissed > tailSamples && lastChunk > 0 && chunk < 0) {
          didFindEnd = true;
        }
        else {
          chunk = 0;
          dismissed++;
        }
      }
      lastChunk = data[index];
      newData[index] = chunk;
      index--;
    }
  }

  return newBuffer;
};

Sample.getNewBufferSize = function (params, sampleRate) {
  var size = sampleRate * params.length;
  if (params.loop) {
    return sampleRate * params.loop;
  }
  else if (params.trimToZeroCrossingPoint) {
    size += Sample.silentTailSize;
  }
  return size;
};

Sample.getNewBufferChannelCount = function (params, buffer) {
  var singles = ['left', 'right', 'diff', 'merge'];
  if (~singles.indexOf(params.channel)) {
    return 1;
  }
  return buffer.numberOfChannels;
};

Sample.getNewBufferTargetChannel = function (params, original) {
  if (original.numberOfChannels === 1) return 0;
  else if (params.channel === 'left') return 0;
  else if (params.channel === 'right') return 1;
  else return null;
};

// Sample.getNewBufferStartingPoint = function (params, buffer) {
//   var offset = buffer.sampleRate * params.offset;
//   return params.reverse ? buffer.length - offset : offset;
// };
//
// Sample.copyChannelData = function (buffer, original, startingPoint, targetChannel, params) {
//
// };

Sample.makeBuffer = memoize(function (params, originalBuffer, context) {

  var sampleRate = originalBuffer.sampleRate;
  var numberOfChannels = Sample.getNewBufferChannelCount(params, originalBuffer);
  var targetChannel = Sample.getNewBufferTargetChannel(params, originalBuffer);
  var workingBuffer = context.createBuffer(numberOfChannels, originalBuffer.length, sampleRate);

  if (targetChannel) {
    Sample.copyChannelData(originalBuffer, workingBuffer, targetChannel);
  }
  else if (params.channel === 'diff') {
    Sample.diffChannelsData(originalBuffer, workingBuffer);
  }
  else if (params.channel === 'merge') {
    Sample.mergeChannelsData(originalBuffer, workingBuffer);
  }
  else {
    for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
      Sample.copyChannelData(originalBuffer, workingBuffer, i);
    }
  }

  if (params.reverse) {
    utils.reverse(workingBuffer);
  }

  if (params.bitcrush) {
    for (var j = 0; j < numberOfChannels; j++) {
      Sample.bitcrushChannelData(workingBuffer, j, params);
    }
  }

  var size = Sample.getNewBufferSize(params, sampleRate);
  var startingPoint = Sample.getNewBufferStartingPoint(params, workingBuffer);
  // if trimToZeroCrossingPoint, find first zero crossing after starting point - also consider the frame just before the above defined starting point, in case it is already right on
  // also, workingBuffer is already reversed - no need to have two different starting points - but the offset needs to be calculated differently
  var outputBuffer = context.createBuffer(numberOfChannels, size, sampleRate);

  for (var k = 0; k < numberOfChannels; k++) {
    Sample.copyChannelData(workingBuffer, outputBuffer, k, startingPoint, size);
  }

  if (params.trimToZeroCrossingPoint && !params.loop) {
    Sample.trimEndToZeroCrossingPoint(outputBuffer);
  }

  debugger;

  return outputBuffer;
}, function memoizeKey (params, buffer, context) {
  return JSON.stringify(params) + buffer.uid;
});

module.exports = Sample;
