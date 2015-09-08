var Effect = require('./Effect');
var numberInRangeType = require('./types/numberInRange');

module.exports = Effect.extend({

  type: 'compressor',

  props: {
    threshold: ['thresholdRange', true, -24],
    knee: ['kneeRange', true, 30],
    ratio: ['ratioRange', true, 12],
    reduction: ['reductionRange', true, -20],
    attack: ['simpleFloatRange', true, 0],
    release: ['simpleFloatRange', true, 0.25]
  },

  dataTypes: {
    thresholdRange: numberInRangeType('thresholdRange', -100, 0),
    kneeRange: numberInRangeType('kneeRange', 0, 40),
    ratioRange: numberInRangeType('ratioRange', 0, 20),
    reductionRange: numberInRangeType('reductionRange', -20, 0),
    simpleFloatRange: numberInRangeType('simpleFloatRange', 0, 1)
  },

  createNode: function () {
    return this.context.createDynamicsCompressor();
  },

  configureNode: function () {
    this.node.threshold.value = this.threshold;
    this.node.knee.value = this.knee;
    this.node.ratio.value = this.ratio;
    this.node.reduction.value = this.reduction;
    this.node.attack.value = this.attack;
    this.node.release.value = this.release;
  }
});
