var Layer = require('./Layer');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  start: function (time, params, out) {
    time = time || this.context.currentTime;

    var gain = this.context.createGain();
    var volume = (params.volume || 100) / 100;
    gain.connect(out);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);

    var oscillator = this.context.createOscillator();

    oscillator.connect(gain);
    oscillator.gain = gain;
    oscillator.frequency.value = params.frequency;
    oscillator.start(time);

    return oscillator;
  },

  stop: function (time, params, oscillator) {
    time = time || this.context.currentTime;
    var gain = oscillator.gain;
    var volume = (params.volume || 100) / 100;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0, time + params.release);
    oscillator.stop(time + params.release);
  }
});

module.exports = Oscillator;
