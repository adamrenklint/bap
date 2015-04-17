var Layer = require('./Layer');
var sampleParams = require('./mixins/sampleParams');
var buffers = {};
var loading = [];

var Sample = Layer.extend(sampleParams, {

  type: 'sample',

  props: {
    loaded: 'boolean',
    buffer: 'any'
  },

  initialize: function (src, options) {
    if (typeof src === 'string') {
      this.src = src;
      src = null;
    }
    Layer.prototype.initialize.call(this, src, options);
    this.on('change:src', this.loadSample);
    this.src && this.loadSample();
  },

  loadSample: function () {
    var buffer = buffers[this.src];
    if (!buffer) {
      this.loaded = false;

      if (loading.indexOf(this.src) > -1) {
        return setTimeout(this.loadSample.bind(this), 10);
      }

      this.vent.trigger('loadingState:add', this.src);
      loading.push(this.src);

      var request = new XMLHttpRequest();
      request.open('GET', this.src, true);
      request.responseType = 'arraybuffer';
      request.onload = function soundWasLoaded () {
        this.context.decodeAudioData(request.response, function (buffer) {
          this.buffer = buffers[this.src] = buffer;
          this.loaded = true;
          loading.splice(loading.indexOf(this.src));
          this.vent.trigger('loadingState:remove', this.src);
        }.bind(this));
      }.bind(this);
      request.send();
    }
    else {
      this.loaded = true;
      this.buffer = buffer;
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

      var mod = -params.pitch/100;
      var full = Math.floor(mod);
      var rest = mod - full;
      var rate = Math.pow(0.5, full);
      return rate * (1 - Math.pow(rest, 2));
    }
    else {
      return (params.pitch / 100) + 1;
    }
  },

  source: function (params) {
    var source = this.context.createBufferSource();
    if (!this.src || !this.buffer) {
      throw new Error('Cannot start sample with SRC and loaded buffer');
    }
    if (!this.src || !this.buffer) {
      throw new Error('Cannot start sample with SRC and loaded buffer');
    }
    source.buffer = this.buffer;
    source.playbackRate.value = this.getPlaybackRate(params);
    return source;
  }
});

module.exports = Sample;
