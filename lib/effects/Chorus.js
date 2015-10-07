var Effect = require('../Effect');
var numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'chorus',

  props: {
    wet: ['volumeRange', true, 100],
    dry: ['volumeRange', true, 0],
    rate: ['rateRange', true, 1.5],
    feedback: ['inclusivePositiveNumber', true, 0.2],
    delay: ['delayRange', true, 0.005],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    rateRange: numberInRangeType('rateRange', 0.01, 99),
    delayRange: numberInRangeType('delayRange', 0, 1)
  },

  createNode: function () {

    var input = this.context.createGain();
    var dry = input._dry = this.context.createGain();
    var wet = input._wet = this.context.createGain();
    var chorus = input._chorus = new this.tuna.Chorus();
    chorus.activate(true);
    var output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(chorus);
    chorus.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function (node) {

    node._dry.gain.value = this.dry / 100;

    node._wet.gain.value = this.wet / 100;
    node._chorus.rate = this.rate;
    node._chorus.feedback = this.feedback;
    node._chorus.delay = this.delay;

    node._output.gain.value = this.gain / 100;
  }
});
