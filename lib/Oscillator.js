var Layer = require('./Layer');
var audioNotes = require('audio-notes');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  _source: function (params) {
    var oscillator = this.context.createOscillator();

    var frequency = params.frequency;
    if (params.note) {
      frequency = audioNotes[params.note] || frequency;
    }
    oscillator.frequency.value = frequency || 0;

    oscillator.detune.value = params.pitch * 100;
    oscillator.type = params.shape;

    return oscillator;
  }
});

module.exports = Oscillator;
