var Layer = require('./Layer');
var sampleParams = require('./mixins/sampleParams');
var buffers = {};
var loading = [];

var Sample = Layer.extend(sampleParams, {

  type: 'sample',

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

  source: function (params) {
    console.log(this.src, this.buffer && this.buffer.duration)

    // var oscillator = this.context.createOscillator();
    // oscillator.frequency.value = params.frequency;
    //
    // var detune = (1200 / 100) * params.pitch;
    // oscillator.detune.value = detune;
    //
    // oscillator.type = params.shape;
    // return oscillator;
  }
});

module.exports = Sample;
