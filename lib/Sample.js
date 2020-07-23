var Layer = require('./Layer');
var Kit = require('./Kit');
var Params = require('./Params');
var BufferHelper = require('./BufferHelper');
var sampleParams = require('./mixins/sampleParams');
var uniqueId = require('./utils/uniqueId');
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

    var playbackRate = params.playbackRate = this._getPlaybackRate(params);

    if (!params.hasLengthFromDuration) {
      var adjustedLength = params.length / playbackRate;
      var durationLength = params.duration && Params.lengthFromDuration(params, params.duration);

      if (durationLength && durationLength < adjustedLength) {
        params.hasLengthFromDuration = true;
        params.length = durationLength;
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

    var buffer = BufferHelper.makeBuffer(params, this.buffer, this.context);

    if (buffer) {
      var source = this.context.createBufferSource();
      source.buffer = buffer;

      source.playbackRate.value = params.playbackRate;

      if (params.loop > 0) {
        source.loop = true;
        source.loopStart = params.offset;
        source.loopEnd = params.offset + params.loop;
      }

      return source;
    }
  },

  _getStopTime: function (time, params, source) {
    var duration = params.hasLengthFromDuration ? source.buffer.duration : source.buffer.duration / params.playbackRate;
    return time + duration;
  },

  _getPlaybackRate: function (params) {
    return Math.pow(2, params.pitch / 12);
  },

  _loadSample: function (countLoading) {
    var buffer = buffers[this.src];
    this.context.resume();
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
      time -= BufferHelper.silentTailSize / 44100;
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

module.exports = Sample;
