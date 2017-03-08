const Effect = require('../Effect');
const overdrive = require('soundbank-overdrive');
const numberInRangeType = require('../types/numberInRange');

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

    const input = this.context.createGain();
    const dry = input._dry = this.context.createGain();
    const _overdrive = input._overdrive = overdrive(this.context);
    const output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(_overdrive);
    _overdrive.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function({_dry, _overdrive, _output}) {

    _dry.gain.value = this.dry / 100;

    _overdrive.gain.value = this.wet / 100;
    _overdrive.preBand.value = this.preBand / 100;
    _overdrive.color.value = this.color;
    _overdrive.postCut.value = this.postCut;

    _output.gain.value = this.gain / 100;
  }
});
