var Layer = require('./Layer');

var Oscillator = Layer.extend({

  type: 'oscillator',

  props: {
    frequency: 'number'
  },

  start: function (time, params) {
    time = time || this.context.currentTime;
    // console.log('osc', time, params);
    // debugger;

    // var duration = note.duration;
    // var length = note.length || this.length || 0;
    // var attack = note.attack || this.attack || 0;
    // var release = note.release || this.release || 0;
    var volume = params.volume / 100;
    // var frequency = note.frequency || this.frequency;
    //
    var oscillator = this.context.createOscillator();
    var gainNode = this.context.createGain();
    //
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
