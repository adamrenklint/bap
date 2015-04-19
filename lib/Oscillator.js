var Layer = require('./Layer');
var audioNotes = require('audio-notes');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  source: function (params) {
    var oscillator = this.context.createOscillator();
    var frequency = params.frequency;
    if (params.note) {
      frequency = audioNotes[params.note] || frequency;
    }
    oscillator.frequency.value = frequency;

    var detune = (1200 / 100) * params.pitch;
    oscillator.detune.value = detune;

    oscillator.type = params.shape;
    return oscillator;
  }
});

module.exports = Oscillator;
