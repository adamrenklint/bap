var Layer = require('./Layer');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  source: function (params) {
    var oscillator = this.context.createOscillator();
    oscillator.frequency.value = params.frequency;

    var detune = (1200 / 100) * params.pitch;
    oscillator.detune.value = detune;

    oscillator.type = params.shape;
    return oscillator;
  }
});

module.exports = Oscillator;
