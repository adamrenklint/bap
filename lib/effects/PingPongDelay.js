var Effect = require('../Effect');
var numberInRangeType = require('../types/numberInRange');

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

    var input = this.context.createGain();
    var dry = input._dry = this.context.createGain();
    var wet = input._wet = this.context.createGain();
    var pingpong = input._pingpong = new this.tuna.PingPongDelay();
    pingpong.activate(true);
    var output = input._output = this.context.createGain();

    input.connect(dry);
    dry.connect(output);

    input.connect(wet);
    wet.connect(pingpong);
    pingpong.connect(output);

    return this.combineNodes(input, output);
  },

  configureNode: function (node) {

    node._dry.gain.value = this.dry / 100;

    node._wet.gain.value = this.wet / 100;
    node._pingpong.wetLevel = 1;
    node._pingpong.feedback = this.feedback;
    node._pingpong.delayTimeLeft = this.left * 1000;
    node._pingpong.delayTimeRight = this.right * 1000;

    node._output.gain.value = this.gain / 100;
  }
});
