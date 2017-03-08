const Model = require('./Model');
const memoize = require('meemo');
const utils = require('audio-buffer-utils');

const BufferHelper = Model.extend({
  type: 'bufferHelper'
});

BufferHelper.silentTailSize = 250;

BufferHelper.trimStart = (buffer, channel) => {
  const data = buffer.getChannelData(channel);
  let didFindZeroCrossing = false;
  let index = 0;

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

BufferHelper.trimEnd = (buffer, channel) => {
  const data = buffer.getChannelData(channel);
  let didFindZeroCrossing = false;
  let index = buffer.length - 1;

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
BufferHelper.bitcrush = (buffer, channel, {bitcrush, bitcrushFrequency, bitcrushMix}) => {
  const data = buffer.getChannelData(channel);
  const bits = bitcrush;
  const normfreq = (bitcrushFrequency - 20) / 22030;
  const mix = (bitcrushMix || 50) / 100;
  const step = Math.pow(1/2, bits);
  let phaser = 0;
  let last = 0;
  let chunk;

  for (let i = 0; i < buffer.length; i++) {
    phaser += normfreq;
    if (phaser >= 1.0) {
        phaser -= 1.0;
        last = step * Math.floor(data[i] / step + 0.5);
    }

    chunk = last;

    if (mix !== 1) {
      const wet = chunk * mix;
      const dry = data[i] * (1 - mix);
      chunk = wet + dry;
    }

    data[i] = chunk;
  }
};

BufferHelper.getCopyLength = (params, buffer) => {
  let length = Math.floor(buffer.sampleRate * params.length);
  const offset = Math.floor(buffer.sampleRate * params.offset);
  if (params.loop) {
    length = Math.floor(buffer.sampleRate * params.loop);
  }
  if (length > buffer.length) return buffer.length;
  if (offset + length > buffer.length) return buffer.length - offset;
  return length;
};

BufferHelper.getChannelCount = ({channel}, {numberOfChannels}) => {
  const singles = ['left', 'right', 'diff', 'merge'];
  if (~singles.indexOf(channel)) {
    return 1;
  }
  return numberOfChannels;
};

BufferHelper.getSourceChannel = ({channel}, {numberOfChannels}) => {
  if (numberOfChannels === 1) return 0;
  else if (channel === 'left') return 0;
  else if (channel === 'right') return 1;
  else return null;
};

BufferHelper.getSourceStartIndex = ({offset}, {sampleRate, length}) => {
  const index = Math.floor(sampleRate * offset);
  if (index >= length) throw new Error('Invalid buffer source start index: params.offset is greater or equal to original buffer length');
  return index;
};

BufferHelper.getTargetStartIndex = ({trimToZeroCrossingPoint, reverse, loop}) => {
  if (trimToZeroCrossingPoint && reverse && !loop) return BufferHelper.silentTailSize;
  return 0;
};

BufferHelper.getRealLength = ({trimToZeroCrossingPoint, loop}, copyLength) => {
  if (trimToZeroCrossingPoint && !loop) return copyLength + BufferHelper.silentTailSize;
  return copyLength;
};

BufferHelper.copyChannelData = (
  originalBuffer,
  outputBuffer,
  sourceChannel,
  targetChannel,
  startIndex,
  targetStartIndex,
  copyLength
) => {
  const input = originalBuffer.getChannelData(sourceChannel);
  const output = outputBuffer.getChannelData(targetChannel);
  const offset = targetStartIndex - startIndex;

  for (let i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = input[i];
  }
};

BufferHelper.diffChannelsData = (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) => {
  const firstInput = originalBuffer.getChannelData(0);
  const secondInput = originalBuffer.getChannelData(1);
  const output = outputBuffer.getChannelData(0);
  const offset = targetStartIndex - startIndex;

  for (let i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] - secondInput[i];
  }
};

BufferHelper.mergeChannelsData = (originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength) => {
  const firstInput = originalBuffer.getChannelData(0);
  const secondInput = originalBuffer.getChannelData(1);
  const output = outputBuffer.getChannelData(0);
  const offset = targetStartIndex - startIndex;

  for (let i = startIndex, max = startIndex + copyLength; i < max; i++) {
    output[i + offset] = firstInput[i] + secondInput[i];
  }
};

BufferHelper.makeBuffer = memoize((params, originalBuffer, context) => {

  const start = new Date();
  const sampleRate = originalBuffer.sampleRate;
  const numberOfChannels = BufferHelper.getChannelCount(params, originalBuffer);
  const sourceChannel = BufferHelper.getSourceChannel(params, originalBuffer);
  const sourceStartIndex = BufferHelper.getSourceStartIndex(params, originalBuffer);
  const targetStartIndex = BufferHelper.getTargetStartIndex(params);
  const copyLength = BufferHelper.getCopyLength(params, originalBuffer);
  const realLength = BufferHelper.getRealLength(params, copyLength);
  const outputBuffer = context.createBuffer(numberOfChannels, realLength, sampleRate);

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
    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
      BufferHelper.copyChannelData(originalBuffer, outputBuffer, i, i, sourceStartIndex, targetStartIndex, copyLength);
    }
  }

  if (params.reverse) {
    utils.reverse(outputBuffer);
  }

  for (let j = 0; j < numberOfChannels; j++) {
    if (params.trimToZeroCrossingPoint && !params.loop) {
      BufferHelper.trimStart(outputBuffer, j);
      BufferHelper.trimEnd(outputBuffer, j);
    }
    if (params.bitcrush) {
      BufferHelper.bitcrush(outputBuffer, j, params);
    }
  }

  return outputBuffer;
}, function memoizeKey (params, buffer, context) {
  let hash = buffer.uid;
  [
    'length', 'offset', 'loop', 'reverse',
    'trimEndToZeroCrossingPoint', 'channel',
    'bitcrush', 'bitcrushFrequency', 'bitcrushMix',
  ].forEach(key => {
    hash += (`//${key}:${params[key]}`);
  });
  return hash;
});

module.exports = BufferHelper;
