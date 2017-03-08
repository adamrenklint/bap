const Effect = require('../Effect');
const numberInRangeType = require('../types/numberInRange');

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

    const input = this.context.createGain();
    const dry = input._dry = this.context.createGain();
    const wet = input._wet = this.context.createGain();
    const filter = input._filter = this.context.createBiquadFilter();
    const output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(filter);
    filter.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function({_dry, _wet, _filter, _output}) {

    _dry.gain.value = this.dry / 100;

    _wet.gain.value = this.wet / 100;
    _filter.type = this.shape;
    _filter.frequency.value = this.frequency;
    _filter.Q.value = this.q;
    _filter.gain.value = this.value / 12;

    _output.gain.value = this.gain / 100;
  }
});
