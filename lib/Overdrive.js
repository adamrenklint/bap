var Effect = require('./Effect');
var overdrive = require('soundbank-overdrive');
var numberInRangeType = require('./types/numberInRange');

// TODO: add wet and dry attribute
// TODO: add gain, after processing signal

module.exports = Effect.extend({

  type: 'overdrive',

  props: {
    gain: ['gainRange', true, 1],
    preBand: ['preBandRange', true, 50],
    color: ['frequencyRange', true, 800],
    postCut: ['frequencyRange', true, 3000]
  },

  dataTypes: {
    gainRange: numberInRangeType('gainRange', 0, 24),
    preBandRange: numberInRangeType('preBandRange', 0, 100),
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  },

  createNode: function () {
    return overdrive(this.context);
  },

  configureNode: function () {
    this.node.gain.value = this.gain;
    this.node.preBand.value = this.preBand / 100;
    this.node.color.value = this.color;
    this.node.postCut.value = this.postCut;
  }
});
