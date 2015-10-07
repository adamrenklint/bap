var Effect = require('../Effect');
var numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'phaser',

  props: {
    wet: ['volumeRange', true, 100],
    dry: ['volumeRange', true, 0],
    rate: ['rateRange', true, 1.2],
    depth: ['depthRange', true, 0.3],
    feedback: ['inclusivePositiveNumber', true, 0.2],
    stereoPhase: ['stereoPhaseRange', true, 45],
    modulationFrequency: ['modulationFrequencyRange', true, 750],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    rateRange: numberInRangeType('rateRange', 0.01, 99),
    depthRange: numberInRangeType('depthRange', 0, 1),
    stereoPhaseRange: numberInRangeType('stereoPhaseRange', 0, 180),
    modulationFrequencyRange: numberInRangeType('modulationFrequencyRange', 500, 1500)
  },

  createNode: function () {

    var input = this.context.createGain();
    var dry = input._dry = this.context.createGain();
    var wet = input._wet = this.context.createGain();
    var phaser = input._phaser = new this.tuna.Phaser();
    phaser.activate(true);
    var output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(phaser);
    phaser.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function (node) {

    node._dry.gain.value = this.dry / 100;

    node._wet.gain.value = this.wet / 100;
    node._phaser.rate = this.rate;
    node._phaser.depth = this.depth;
    node._phaser.feedback = this.feedback;
    node._phaser.stereoPhase = this.stereoPhase;
    node._phaser.baseModulationFrequency = this.modulationFrequency;

    node._output.gain.value = this.gain / 100;
  }
});
