var Effect = require('../Effect');
var numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'filter',

  props: {
    wet: ['volumeRange', true, 100],
    dry: ['volumeRange', true, 0],
    frequency: ['frequencyRange', true, 440],
    q: ['qRange', true, 1],
    shape: {
      type: 'string',
      default: 'highpass',
      values: ['highpass', 'lowpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
    },
    value: ['filterValueRange', true, 0],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    qRange: numberInRangeType('qRange', 0.001, 100),
    filterValueRange: numberInRangeType('filterValueRange', -999, 999)
  },

  createNode: function () {

    var input = this.context.createGain();
    var dry = input._dry = this.context.createGain();
    var wet = input._wet = this.context.createGain();
    var filter = input._filter = this.context.createBiquadFilter();
    var output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(filter);
    filter.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function (node) {

    node._dry.gain.value = this.dry / 100;

    node._wet.gain.value = this.wet / 100;
    node._filter.type = this.shape;
    node._filter.frequency.value = this.frequency;
    node._filter.Q.value = this.q;
    node._filter.gain.value = this.value / 12;

    node._output.gain.value = this.gain / 100;
  }
});
