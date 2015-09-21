var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');

module.exports = Model.extend({

  type: 'effect',

  props: {
    nodes: ['object', true, function () { return {}; }]
  },

  dataTypes: {
    volumeRange: numberInRangeType('volumeRange', 0, 999),
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  },

  createNode: function () {
    throw new Error('Required method "createNode" is not implemented for ' + this.cid);
  },

  configureNode: function (node) {
    throw new Error('Required method "configureNode" is not implemented for ' + this.cid);
  },

  combineNodes: function (input, output) {

    input.connect = function (destination) {
      output.connect(destination);
    };

    input.disconnect = function () {
      output.disconnect();
    };

    return input;
  },

  getNode: function (destinationId) {
    var nodes = this.nodes;
    var node = nodes[destinationId] = nodes[destinationId] || this.createNode();
    this.configureNode(node);
    return node;
  }
});
