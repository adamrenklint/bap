var Layer = require('./Layer');
var oscillatorParams = require('./mixins/oscillatorParams');

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  start: function (time, params) {
    time = time || this.context.currentTime;

    var volume = params.volume / 100;

    var oscillator = this.context.createOscillator();

    // gain could be done in layer.setGain, handled from layer.runEvent
    var gainNode = this.context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = params.frequency;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + params.attack);

    oscillator.start(time);

    if (!params.duration && params.length) {
      oscillator.stop(time + params.length + params.release);
      gainNode.gain.setValueAtTime(volume, time + params.length);
      gainNode.gain.linearRampToValueAtTime(0, time + params.length + params.release);
    }
  }
});

module.exports = Oscillator;
