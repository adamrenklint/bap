var Effect = require('./Effect');
var overdrive = require('soundbank-overdrive');
var numberInRangeType = require('./types/numberInRange');

module.exports = Effect.extend({

  type: 'overdrive',

  props: {
    wet: ['volumeRange', true, 50],
    dry: ['volumeRange', true, 50],
    preBand: ['preBandRange', true, 50],
    color: ['frequencyRange', true, 800],
    postCut: ['frequencyRange', true, 3000],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    preBandRange: numberInRangeType('preBandRange', 0, 100)
  },

  createNode: function () {

    var input = this.context.createGain();
    var dry = input._dry = this.context.createGain();
    var _overdrive = input._overdrive = overdrive(this.context);
    var output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(_overdrive);
    _overdrive.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function (node) {

    node._dry.gain.value = this.dry / 100;

    node._overdrive.gain.value = this.wet / 100;
    node._overdrive.preBand.value = this.preBand / 100;
    node._overdrive.color.value = this.color;
    node._overdrive.postCut.value = this.postCut;

    node._output.gain.value = this.gain / 100;
  }
});
