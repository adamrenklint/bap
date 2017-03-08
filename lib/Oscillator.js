const Layer = require('./Layer');
const audioNotes = require('audio-notes');
const oscillatorParams = require('./mixins/oscillatorParams');

const Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  _source: function (params) {
    const oscillator = this.context.createOscillator();

    let frequency = params.frequency;
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
