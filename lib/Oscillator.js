var Layer = require('./Layer');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  source: function (params) {
    var oscillator = this.context.createOscillator();
    oscillator.frequency.value = params.frequency;
    oscillator.type = params.shape;
    return oscillator;
  }
});

module.exports = Oscillator;
