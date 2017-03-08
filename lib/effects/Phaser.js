const Effect = require('../Effect');
const numberInRangeType = require('../types/numberInRange');

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

    const input = this.context.createGain();
    const dry = input._dry = this.context.createGain();
    const wet = input._wet = this.context.createGain();
    const phaser = input._phaser = new this.tuna.Phaser();
    phaser.activate(true);
    const output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(phaser);
    phaser.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function({_dry, _wet, _phaser, _output}) {

    _dry.gain.value = this.dry / 100;

    _wet.gain.value = this.wet / 100;
    _phaser.rate = this.rate;
    _phaser.depth = this.depth;
    _phaser.feedback = this.feedback;
    _phaser.stereoPhase = this.stereoPhase;
    _phaser.baseModulationFrequency = this.modulationFrequency;

    _output.gain.value = this.gain / 100;
  }
});
