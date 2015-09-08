var Effect = require('./Effect');
var delay = require('soundbank-delay');
var numberInRangeType = require('./types/numberInRange');

module.exports = Effect.extend({

  type: 'delay',

  props: {
    time: ['inclusivePositiveNumber', true, 0.3],
    wet: ['inclusivePositiveNumber', true, 50],
    dry: ['inclusivePositiveNumber', true, 100],
    feedback: ['inclusivePositiveNumber', true, 50],
    cutoff: ['frequency', true, 50],
    filter: {
      type: 'string',
      default: 'highpass',
      values: ['highpass', 'lowpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
    }
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    frequency: numberInRangeType('frequency', 20, 22050)
  },

  createNode: function () {
    return delay(this.context);
  },

  configureNode: function () {
    this.node.time = this.time;
    this.node.wet.value = this.wet / 100;
    this.node.dry.value = this.dry / 100;
    this.node.filterType = this.filter;
    this.node.cutoff.value = this.cutoff;
    this.node.feedback.value = this.feedback / 100;
  }
});
