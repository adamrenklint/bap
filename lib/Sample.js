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

  initialize: function (src) {
    if (typeof src === 'string') {
      this.src = src;
    }
    Layer.prototype.initialize.apply(this, arguments);
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

  source: function (params) {
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;
    return source;
  }
});

module.exports = Sample;
