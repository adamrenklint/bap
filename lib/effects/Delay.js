const Effect = require('../Effect');
const delay = require('soundbank-delay');
const numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'delay',

  props: {
    wet: ['volumeRange', true, 50],
    dry: ['volumeRange', true, 100],
    time: ['delayTimeRange', true, 0.3],
    feedback: ['volumeRange', true, 50],
    cutoff: ['frequencyRange', true, 50],
    filter: {
      type: 'string',
      default: 'highpass',
      values: ['highpass', 'lowpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
    },
    sync: ['boolean', true, false]
  },

  dataTypes: {
    delayTimeRange: numberInRangeType('delayTimeRange', 0.001, 4)
  },

  createNode: function () {
    return delay(this.context);
  },

  configureNode: function (node) {
    this.vent.trigger('clock:tempo', node);
    node.sync = this.sync;
    node.time.value = this.time;
    node.wet.value = this.wet / 100;
    node.dry.value = this.dry / 100;
    node.filterType = this.filter;
    node.cutoff.value = this.cutoff;
    node.feedback.value = this.feedback / 100;
  }
});
