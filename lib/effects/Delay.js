var Effect = require('../Effect');
var delay = require('soundbank-delay');

module.exports = Effect.extend({

  type: 'delay',

  props: {
    wet: ['volumeRange', true, 50],
    dry: ['volumeRange', true, 100],
    time: ['inclusivePositiveNumber', true, 0.3],
    feedback: ['inclusivePositiveNumber', true, 50],
    cutoff: ['frequencyRange', true, 50],
    filter: {
      type: 'string',
      default: 'highpass',
      values: ['highpass', 'lowpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
    }
  },

  createNode: function () {
    return delay(this.context);
  },

  configureNode: function (node) {
    node.time = this.time;
    node.wet.value = this.wet / 100;
    node.dry.value = this.dry / 100;
    node.filterType = this.filter;
    node.cutoff.value = this.cutoff;
    node.feedback.value = this.feedback / 100;
  }
});
