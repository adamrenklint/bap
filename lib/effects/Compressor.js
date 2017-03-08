const Effect = require('../Effect');
const numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'compressor',

  props: {
    threshold: ['thresholdRange', true, -12],
    knee: ['kneeRange', true, 30],
    ratio: ['ratioRange', true, 12],
    attack: ['simpleFloatRange', true, 0.01],
    release: ['simpleFloatRange', true, 0.01],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    thresholdRange: numberInRangeType('thresholdRange', -100, 0),
    kneeRange: numberInRangeType('kneeRange', 0, 40),
    ratioRange: numberInRangeType('ratioRange', 0, 20),
    simpleFloatRange: numberInRangeType('simpleFloatRange', 0, 1)
  },

  createNode: function () {
    const node = this.context.createDynamicsCompressor();
    const output = node._output = this.context.createGain();
    node.connect(output);
    return this.combineNodes(node, output);
  },

  configureNode: function (node) {

    node.threshold.value = this.threshold;
    node.knee.value = this.knee;
    node.ratio.value = this.ratio;
    node.attack.value = this.attack;
    node.release.value = this.release;

    node._output.gain.value = this.gain / 100;
  }
});
