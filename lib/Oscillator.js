var Layer = require('./Layer');

var Oscillator = Layer.extend({

  type: 'oscillator',

  props: {
    frequency: 'number'
  },

  triggerAt: function (time, note) {

    var oscillator = this.context.createOscillator();
    // gainNode = step.context.createGain();
    oscillator.connect(this.context.destination);
    // gainNode.connect(step.context.destination);
    oscillator.frequency.value = note.frequency || this.frequency;
    // gainNode.gain.setValueAtTime(1, step.time);
    oscillator.start(time);
    oscillator.stop(time + 0.1);
  }
});

module.exports = Oscillator;
