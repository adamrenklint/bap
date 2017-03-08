const Effect = require('../Effect');
const numberInRangeType = require('../types/numberInRange');

module.exports = Effect.extend({

  type: 'pingpong',

  props: {
    wet: ['volumeRange', true, 100],
    dry: ['volumeRange', true, 0],
    feedback: ['feedbackRange', true, 0.2],
    left: ['delayTimeRange', true, 0.15],
    right: ['delayTimeRange', true, 0.2],
    gain: ['volumeRange', true, 100]
  },

  dataTypes: {
    feedbackRange: numberInRangeType('feedbackRange', 0, 1),
    delayTimeRange: numberInRangeType('delayTimeRange', 0.001, 10)
  },

  createNode: function () {

    const input = this.context.createGain();
    const dry = input._dry = this.context.createGain();
    const wet = input._wet = this.context.createGain();
    const pingpong = input._pingpong = new this.tuna.PingPongDelay();
    pingpong.activate(true);
    const output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(pingpong);
    pingpong.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function({_dry, _wet, _pingpong, _output}) {

    _dry.gain.value = this.dry / 100;

    _wet.gain.value = this.wet / 100;
    _pingpong.wetLevel = 1;
    _pingpong.feedback = this.feedback;
    _pingpong.delayTimeLeft = this.left * 1000;
    _pingpong.delayTimeRight = this.right * 1000;

    _output.gain.value = this.gain / 100;
  }
});
