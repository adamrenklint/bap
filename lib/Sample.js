var Layer = require('./Layer');
var Kit = require('./Kit');
var sampleParams = require('./mixins/sampleParams');
var memoize = require('lodash.memoize');
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
      params.offset = this.buffer.duration - (params.offset + params.length);
    }

    var playbackRate = params.playbackRate = this._getPlaybackRate(params);

    if (!params.hasLengthFromDuration) {
      var adjustedLength = params.length / playbackRate;
      var durationLength = params.duration && params._lengthFromDuration(params.duration);

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
    source.buffer = Sample.makeBuffer(params.toJSON(), this.buffer, this.context);

    source.playbackRate.value = params.playbackRate;

    if (params.loop > 0) {
      source.loop = true;
      source.loopStart = params.offset;
      source.loopEnd = params.offset + params.loop;
    }

    return source;
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

Sample.makeBuffer = memoize(function (params, buffer, context) {

  if (!params.channel || buffer.numberOfChannels < 2) {
    if (params.reverse) {
      buffer.context = context;
      var revBuffer = utils.clone(buffer);
      utils.reverse(revBuffer);
      return revBuffer;
    }
    else {
      return buffer;
    }
  }

  var newBuffer = context.createBuffer(1, buffer.length, buffer.sampleRate);
  var index = params.channel === 'left' ? 0 : 1;
  var altIndex = params.channel === 'left' ? 1 : 0;
  var data = buffer.getChannelData(index);
  var altData = buffer.getChannelData(altIndex);
  var newData = newBuffer.getChannelData(0);

  var merge = params.channel === 'merge';
  var diff = params.channel === 'diff';

  for (var i = 0; i < data.length; i++) {
    if (merge) {
      newData[i] = data[i] + altData[i];
    }
    else if (diff) {
      newData[i] = data[i] - altData[i];
    }
    else {
      newData[i] = data[i];
    }
  }
  if (params.reverse) {
    utils.reverse(newBuffer);
  }
  return newBuffer;
}, function memoizeKey (params, buffer, context) {
  return JSON.stringify(params) + buffer.uid;
});

module.exports = Sample;
