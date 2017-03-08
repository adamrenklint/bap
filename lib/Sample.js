const Layer = require('./Layer');
const Kit = require('./Kit');
const Params = require('./Params');
const BufferHelper = require('./BufferHelper');
const sampleParams = require('./mixins/sampleParams');
const uniqueId = require('./utils/uniqueId');
const slotIds = 'QWERTYUIOPASDFGHJKLZXCVBNM';

const buffers = {};
const loading = {};

const Sample = Layer.extend({

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
      const cycles = Math.floor(index / slotIds.length);
      index -= (cycles * slotIds.length);
      return slotIds[cycles - 1] + slotIds[index];
    }
  },

  slice: function (pieces) {
    // not clean, but I'm not sure of another way of solving this circular dependency
    const kit = new this.vent.bap.kit();
    for (let i = 0; i < pieces; i++) {
      kit.slot(this._getSlotId(i)).layer(this.with({
        sliceExpression: `${i + 1}/${pieces}`
      }));
    }
    return kit;
  },

  _params: function () {
    const params = Layer.prototype._params.apply(this, arguments);

    params.length = params.length || this.buffer && (this.buffer.duration - params.offset) || 0;

    const playbackRate = params.playbackRate = this._getPlaybackRate(params);

    if (!params.hasLengthFromDuration) {
      const adjustedLength = params.length / playbackRate;
      const durationLength = params.duration && Params.lengthFromDuration(params, params.duration);

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

    const source = this.context.createBufferSource();
    source.buffer = BufferHelper.makeBuffer(params, this.buffer, this.context);

    source.playbackRate.value = params.playbackRate;

    if (params.loop > 0) {
      source.loop = true;
      source.loopStart = params.offset;
      source.loopEnd = params.offset + params.loop;
    }

    return source;
  },

  _getStopTime: function(time, {hasLengthFromDuration, playbackRate}, {buffer}) {
    const duration = hasLengthFromDuration ? buffer.duration : buffer.duration / playbackRate;
    return time + duration;
  },

  _getPlaybackRate: function({pitch}) {
    return Math.pow(2, pitch / 12);
  },

  _loadSample: function (countLoading) {
    const buffer = buffers[this.src];
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

      const request = new XMLHttpRequest();
      request.open('GET', this.src, true);
      request.responseType = 'arraybuffer';
      request.onload = function soundWasLoaded () {
        this.context.decodeAudioData(request.response, buffer => {
          buffer.uid = uniqueId('buffer');
          this.buffer = buffers[this.src] = buffer;
          loading[this.src]--;
          this.loaded = true;
          if (!loading[this.src]) {
            this.vent.trigger('loadingState:remove', this.src);
          }
          request.onload = null;
        });
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
      const length = this.buffer.duration;
      const parts = this.sliceExpression.split('/');
      const index = parseInt(parts[0], 10) - 1;
      const total = parseInt(parts[1], 10);
      const sliceLength = length / total;
      const offset = index * sliceLength;

      this.length = sliceLength;
      this.offset = offset;
    }
  }
}, sampleParams);

module.exports = Sample;
