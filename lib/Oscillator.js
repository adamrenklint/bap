var Layer = require('./Layer');

var Oscillator = Layer.extend({

  type: 'oscillator',

  props: {
    frequency: 'number'
  },

  start: function (time, params) {
    time = time || this.context.currentTime;
    console.log('osc', time, params);
    debugger;

    // var duration = note.duration;
    // var length = note.length || this.length || 0;
    // var attack = note.attack || this.attack || 0;
    // var release = note.release || this.release || 0;
    // var volume = (note.volume || this.volume || 100) / 100;
    // var frequency = note.frequency || this.frequency;
    //
    // var oscillator = this.context.createOscillator();
    // var gainNode = this.context.createGain();
    //
    // oscillator.connect(gainNode);
    // gainNode.connect(this.context.destination);
    //
    // oscillator.frequency.value = frequency;
    //
    // gainNode.gain.setValueAtTime(0, time);
    // gainNode.gain.linearRampToValueAtTime(volume, time + attack);
    //
    // oscillator.start(time);
    //
    // if (!note.duration && length) {
    //   oscillator.stop(time + length + release);
    //   gainNode.gain.setValueAtTime(volume, time + length);
    //   gainNode.gain.linearRampToValueAtTime(0, time + length + release);
    // }
  }
});

module.exports = Oscillator;
