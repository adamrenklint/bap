var Layer = require('./Layer');
var sampleParams = require('./mixins/sampleParams');
var buffers = {};
var loading = [];

var Sample = Layer.extend(sampleParams, {

  type: 'sample',

  initialize: function () {
    Layer.prototype.initialize.apply(this, arguments);
    this.on('change:src', this.loadSample);
    this.src && this.loadSample();
  },

  loadSample: function () {
    var buffer = buffers[this.src];
    if (!buffer) {
      loaded = false;

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
          buffers[this.src] = buffer;
          console.log(this.src, buffer.length)
          loading.splice(loading.indexOf(this.src));
          this.vent.trigger('loadingState:remove', this.src);
        }.bind(this));
      }.bind(this);
      request.send();
    }
  },

  source: function (params) {
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
