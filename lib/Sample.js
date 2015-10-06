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
      time -= Sample.silentTailSize / 44100;
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

Sample.silentTailSize = 250;

Sample.trimStartToZeroCrossingPoint = function (buffer, channel) {
  var data = buffer.getChannelData(channel);
  var didFindZeroCrossing = false;
  var index = 0;

  while (!didFindZeroCrossing && index < buffer.length) {
    if (data[index] > 0) {
      didFindZeroCrossing = true;
    }
    else {
      data[index] = 0;
      index++;
    }
  }
};

Sample.trimEndToZeroCrossingPoint = function (buffer, channel) {
  var data = buffer.getChannelData(channel);
  var didFindZeroCrossing = false;
  var index = buffer.length - 1;

  while (!didFindZeroCrossing && index >= 0) {
    if (data[index] < 0) {
      didFindZeroCrossing = true;
    }
    else {
      data[index] = 0;
      index--;
    }
  }
};

// http://noisehack.com/custom-audio-effects-javascript-web-audio-api/
Sample.bitcrushChannelData = function (buffer, channel, params) {
  var data = buffer.getChannelData(channel);
  var bits = params.bitcrush;
  var normfreq = (params.bitcrushFrequency - 20) / 22030;
  var mix = (params.bitcrushMix || 50) / 100;
  var step = Math.pow(1/2, bits);
  var phaser = 0;
  var last = 0;
  var chunk;

  for (var i = 0; i < buffer.length; i++) {
    phaser += normfreq;
    if (phaser >= 1.0) {
        phaser -= 1.0;
        last = step * Math.floor(data[i] / step + 0.5);
    }

    chunk = last;

    if (mix !== 1) {
      var wet = chunk * mix;
      var dry = data[i] * (1 - mix);
      chunk = wet + dry;
    }

    data[i] = chunk;
  }
};

Sample.getNewBufferCopyLength = function (params, buffer) {
  var length = buffer.sampleRate * params.length;
  var offset = buffer.sampleRate * params.offset;
  if (params.loop) {
    length = buffer.sampleRate * params.loop;
  }
  if (length > buffer.length) return buffer.length;
  if (offset + length > buffer.length) return buffer.length - offset;
  return length;
};

Sample.getNewBufferChannelCount = function (params, buffer) {
  var singles = ['left', 'right', 'diff', 'merge'];
  if (~singles.indexOf(params.channel)) {
    return 1;
  }
  return buffer.numberOfChannels;
};

Sample.getNewBufferSourceChannel = function (params, original) {
  if (original.numberOfChannels === 1) return 0;
  else if (params.channel === 'left') return 0;
  else if (params.channel === 'right') return 1;
  else return null;
};

Sample.getNewBufferSourceStartIndex = function (params, buffer) {
  var index = buffer.sampleRate * params.offset;
  if (index >= buffer.length) throw new Error('Invalid buffer source start index: params.offset is greater or equal to original buffer length');
  return index;
};

Sample.getNewBufferTargetStartIndex = function (params) {
  if (params.trimToZeroCrossingPoint && params.reverse && !params.loop) return Sample.silentTailSize;
  return 0;
};

Sample.getNewBufferRealLength = function (params, copyLength) {
  if (params.trimToZeroCrossingPoint && !params.loop) return copyLength + Sample.silentTailSize;
  return copyLength;
};

Sample.copyChannelData = function (originalBuffer, outputBuffer, sourceChannel, targetChannel, startIndex, targetStartIndex, copyLength) {
  var input = originalBuffer.getChannelData(sourceChannel);
  var output = outputBuffer.getChannelData(targetChannel);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = input[i];
  }
};

Sample.diffChannelsData = function (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) {
  var firstInput = originalBuffer.getChannelData(0);
  var secondInput = originalBuffer.getChannelData(1);
  var output = outputBuffer.getChannelData(0);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] - secondInput[i];
  }
};

Sample.mergeChannelsData = function (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) {
  var firstInput = originalBuffer.getChannelData(0);
  var secondInput = originalBuffer.getChannelData(1);
  var output = outputBuffer.getChannelData(0);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] + secondInput[i];
  }
};

Sample.makeBuffer = memoize(function (params, originalBuffer, context) {

  var sampleRate = originalBuffer.sampleRate;
  var numberOfChannels = Sample.getNewBufferChannelCount(params, originalBuffer);
  var sourceChannel = Sample.getNewBufferSourceChannel(params, originalBuffer);
  var sourceStartIndex = Sample.getNewBufferSourceStartIndex(params, originalBuffer);
  var targetStartIndex = Sample.getNewBufferTargetStartIndex(params);
  var copyLength = Sample.getNewBufferCopyLength(params, originalBuffer);
  var realLength = Sample.getNewBufferRealLength(params, copyLength);
  var outputBuffer = context.createBuffer(numberOfChannels, realLength, sampleRate);

  if (sourceChannel) {
    Sample.copyChannelData(originalBuffer, outputBuffer, sourceChannel, 0, sourceStartIndex, targetStartIndex, copyLength);
  }
  else if (params.channel === 'diff') {
    Sample.diffChannelsData(originalBuffer, outputBuffer, sourceStartIndex, targetStartIndex, copyLength);
  }
  else if (params.channel === 'merge') {
    Sample.mergeChannelsData(originalBuffer, outputBuffer, sourceStartIndex, targetStartIndex, copyLength);
  }
  else {
    for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
      Sample.copyChannelData(originalBuffer, outputBuffer, i, i, sourceStartIndex, targetStartIndex, copyLength);
    }
  }

  if (params.reverse) {
    utils.reverse(outputBuffer);
  }

  for (var j = 0; j < numberOfChannels; j++) {
    if (params.trimToZeroCrossingPoint && !params.loop) {
      Sample.trimStartToZeroCrossingPoint(outputBuffer, j);
      Sample.trimEndToZeroCrossingPoint(outputBuffer, j);
    }
    if (params.bitcrush) {
      Sample.bitcrushChannelData(outputBuffer, j, params);
    }
  }

  return outputBuffer;
}, function memoizeKey (params, buffer, context) {
  return JSON.stringify(params) + buffer.uid;
});

module.exports = Sample;
