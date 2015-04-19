var Layer = require('./Layer');
var Kit = require('./Kit');
var sampleParams = require('./mixins/sampleParams');

var buffers = {};
var loading = {};

var Sample = Layer.extend(sampleParams, {

  type: 'sample',

  props: {
    loaded: 'boolean',
    sliceExpression: 'string',
    buffer: 'any'
  },

  initialize: function (src, options) {
    if (typeof src === 'string') {
      this.src = src;
      src = null;
    }
    Layer.prototype.initialize.call(this, src, options);
    this.on('change:src', this.loadSample);
    this.on('change:loaded', this.configureSlice);
    this.on('change:sliceExpression', this.configureSlice);
    this.src && this.loadSample();
    this.configureSlice();
  },

  loadSample: function (countLoading) {
    var buffer = buffers[this.src];
    if (!buffer) {
      this.loaded = false;

      if (loading[this.src]) {
        if (countLoading !== false) {
          loading[this.src]++;
        }
        return setTimeout(this.loadSample.bind(this, false), 10);
      }

      this.vent.trigger('loadingState:add', this.src);
      loading[this.src] = 1;

      var request = new XMLHttpRequest();
      request.open('GET', this.src, true);
      request.responseType = 'arraybuffer';
      request.onload = function soundWasLoaded () {
        this.context.decodeAudioData(request.response, function (buffer) {
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

  configureSlice: function () {
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
  },

  params: function () {
    var params = Layer.prototype.params.apply(this, arguments);
    params.length = params.length || this.buffer && this.buffer.duration || 0;
    return params;
  },

  startSource: function (time, params, source) {
    source.start(time, params.offset || 0);
  },

  createGain: function (params, source) {
    // TODO: sample.channel null, left, right
    return Layer.prototype.createGain.call(params, source);
  },

  getPlaybackRate: function (params) {
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

  source: function (params) {
    if (!this.src || !this.buffer) {
      throw new Error('Cannot start sample with SRC and loaded buffer');
    }
    if (!this.src || !this.buffer) {
      throw new Error('Cannot start sample with SRC and loaded buffer');
    }
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;

    var playbackRate = this.getPlaybackRate(params);
    source.playbackRate.value = playbackRate;
    if (!params.hasLengthFromDuration) {
      params.length = params.length / playbackRate;
    }

    return source;
  },

  slice: function (pieces) {
    // not clean, but I'm not sure of another way of solving this circular dependency
    var kit = new this.vent.bap.kit();
    for (var i = 0; i < pieces; i++) {
      kit.slot(i + 1).layer(this.with({
        sliceExpression: '' + (i + 1) + '/' + pieces
      }));
    }
    return kit;
  }
});

module.exports = Sample;
