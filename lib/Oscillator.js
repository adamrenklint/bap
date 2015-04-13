var Layer = require('./Layer');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  start: function (time, params) {
    time = time || this.context.currentTime;

    var gain = this.context.createGain();
    var volume = (params.volume || 100) / 100;
    gain.connect(this.context.destination);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);

    // TODO: need a better transport system for the source, if the sounds triggers again before the prev stop event, one node is left hanging
    var oscillator = this.s = this.context.createOscillator();

    oscillator.connect(gain);
    oscillator.gain = gain;
    oscillator.frequency.value = params.frequency;

    oscillator.start(time);
  },


  stop: function (time, params) {
    time = time || this.context.currentTime;
    var oscillator = this.s;
    var volume = (params.volume || 100) / 100;
    var gain = oscillator.gain;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0, time + params.release);
    oscillator.stop(time + params.release);
  }
});

module.exports = Oscillator;
