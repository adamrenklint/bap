require('es6-object-assign').polyfill();

var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');

module.exports = Model.extend({

  type: 'effect',

  props: {
    bypass: ['boolean', true, false],
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

  getNode: function (destinationId, time) {

    var nodes = this.nodes;

    var json = this.toJSON();
    delete json.nodes;
    delete json.revision;
    delete json.bypass;
    var params = JSON.stringify(json);

    var id = destinationId + '//' + params;
    var node = nodes[id];

    if (!node) {
      node = nodes[id] = this.createNode();
      this.configureNode(node);
    }

    return node;
  }
});
