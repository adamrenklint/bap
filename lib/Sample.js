var Layer = require('./Layer');
var sampleParams = require('./mixins/sampleParams');

var Sample = Layer.extend(sampleParams, {

  type: 'sample',

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
