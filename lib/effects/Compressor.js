var Effect = require('../Effect');
var numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'compressor',

  props: {
    threshold: ['thresholdRange', true, -24],
    knee: ['kneeRange', true, 30],
    ratio: ['ratioRange', true, 12],
    reduction: ['reductionRange', true, -20],
    attack: ['simpleFloatRange', true, 0],
    release: ['simpleFloatRange', true, 0.25],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    thresholdRange: numberInRangeType('thresholdRange', -100, 0),
    kneeRange: numberInRangeType('kneeRange', 0, 40),
    ratioRange: numberInRangeType('ratioRange', 0, 20),
    reductionRange: numberInRangeType('reductionRange', -20, 0),
    simpleFloatRange: numberInRangeType('simpleFloatRange', 0, 1)
  },

  createNode: function () {
    var node = this.context.createDynamicsCompressor();
    var output = node._output = this.context.createGain();
    node.connect(output);
    return this.combineNodes(node, output);
  },

  configureNode: function (node) {

    node.threshold.value = this.threshold;
    node.knee.value = this.knee;
    node.ratio.value = this.ratio;
    node.reduction.value = this.reduction;
    node.attack.value = this.attack;
    node.release.value = this.release;

    node._output.gain.value = this.gain / 100;
  }
});
