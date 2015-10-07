var Model = require('./Model');
var memoize = require('meemo');
var utils = require('audio-buffer-utils');

var BufferHelper = Model.extend({
  type: 'bufferHelper'
});

BufferHelper.silentTailSize = 250;

BufferHelper.trimStartToZeroCrossingPoint = function (buffer, channel) {
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

BufferHelper.trimEndToZeroCrossingPoint = function (buffer, channel) {
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
BufferHelper.bitcrushChannelData = function (buffer, channel, params) {
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

BufferHelper.getNewBufferCopyLength = function (params, buffer) {
  var length = Math.floor(buffer.sampleRate * params.length);
  var offset = Math.floor(buffer.sampleRate * params.offset);
  if (params.loop) {
    length = Math.floor(buffer.sampleRate * params.loop);
  }
  if (length > buffer.length) return buffer.length;
  if (offset + length > buffer.length) return buffer.length - offset;
  return length;
};

BufferHelper.getNewBufferChannelCount = function (params, buffer) {
  var singles = ['left', 'right', 'diff', 'merge'];
  if (~singles.indexOf(params.channel)) {
    return 1;
  }
  return buffer.numberOfChannels;
};

BufferHelper.getNewBufferSourceChannel = function (params, original) {
  if (original.numberOfChannels === 1) return 0;
  else if (params.channel === 'left') return 0;
  else if (params.channel === 'right') return 1;
  else return null;
};

BufferHelper.getNewBufferSourceStartIndex = function (params, buffer) {
  var index = Math.floor(buffer.sampleRate * params.offset);
  if (index >= buffer.length) throw new Error('Invalid buffer source start index: params.offset is greater or equal to original buffer length');
  return index;
};

BufferHelper.getNewBufferTargetStartIndex = function (params) {
  if (params.trimToZeroCrossingPoint && params.reverse && !params.loop) return BufferHelper.silentTailSize;
  return 0;
};

BufferHelper.getNewBufferRealLength = function (params, copyLength) {
  if (params.trimToZeroCrossingPoint && !params.loop) return copyLength + BufferHelper.silentTailSize;
  return copyLength;
};

BufferHelper.copyChannelData = function (originalBuffer, outputBuffer, sourceChannel, targetChannel, startIndex, targetStartIndex, copyLength) {
  var input = originalBuffer.getChannelData(sourceChannel);
  var output = outputBuffer.getChannelData(targetChannel);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = input[i];
  }
};

BufferHelper.diffChannelsData = function (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) {
  var firstInput = originalBuffer.getChannelData(0);
  var secondInput = originalBuffer.getChannelData(1);
  var output = outputBuffer.getChannelData(0);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] - secondInput[i];
  }
};

BufferHelper.mergeChannelsData = function (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) {
  var firstInput = originalBuffer.getChannelData(0);
  var secondInput = originalBuffer.getChannelData(1);
  var output = outputBuffer.getChannelData(0);
  var offset = targetStartIndex - startIndex;

  for (var i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] + secondInput[i];
  }
};

BufferHelper.makeBuffer = memoize(function (params, originalBuffer, context) {

  var start = new Date();
  var sampleRate = originalBuffer.sampleRate;
  var numberOfChannels = BufferHelper.getNewBufferChannelCount(params, originalBuffer);
  var sourceChannel = BufferHelper.getNewBufferSourceChannel(params, originalBuffer);
  var sourceStartIndex = BufferHelper.getNewBufferSourceStartIndex(params, originalBuffer);
  var targetStartIndex = BufferHelper.getNewBufferTargetStartIndex(params);
  var copyLength = BufferHelper.getNewBufferCopyLength(params, originalBuffer);
  var realLength = BufferHelper.getNewBufferRealLength(params, copyLength);
  var outputBuffer = context.createBuffer(numberOfChannels, realLength, sampleRate);

  if (sourceChannel) {
    BufferHelper.copyChannelData(originalBuffer, outputBuffer, sourceChannel, 0, sourceStartIndex, targetStartIndex, copyLength);
  }
  else if (params.channel === 'diff') {
    BufferHelper.diffChannelsData(originalBuffer, outputBuffer, sourceStartIndex, targetStartIndex, copyLength);
  }
  else if (params.channel === 'merge') {
    BufferHelper.mergeChannelsData(originalBuffer, outputBuffer, sourceStartIndex, targetStartIndex, copyLength);
  }
  else {
    for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
      BufferHelper.copyChannelData(originalBuffer, outputBuffer, i, i, sourceStartIndex, targetStartIndex, copyLength);
    }
  }

  if (params.reverse) {
    utils.reverse(outputBuffer);
  }

  for (var j = 0; j < numberOfChannels; j++) {
    if (params.trimToZeroCrossingPoint && !params.loop) {
      BufferHelper.trimStartToZeroCrossingPoint(outputBuffer, j);
      BufferHelper.trimEndToZeroCrossingPoint(outputBuffer, j);
    }
    if (params.bitcrush) {
      BufferHelper.bitcrushChannelData(outputBuffer, j, params);
    }
  }

  return outputBuffer;
}, function memoizeKey (params, buffer, context) {
  var hash = buffer.uid;
  [
    'length', 'offset', 'loop', 'reverse',
    'trimEndToZeroCrossingPoint', 'channel',
    'bitcrush', 'bitcrushFrequency', 'bitcrushMix',
  ].forEach(function (key) {
    hash += ('//' + key + ':' + params[key]);
  });
  return hash;
});

module.exports = BufferHelper;
