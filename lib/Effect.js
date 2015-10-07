require('es6-object-assign').polyfill();

var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');

var Tuna = require('tunajs');
var tuna;

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

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    tuna = tuna || new Tuna(this.context);
    this.tuna = tuna;
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

  getDestinationId: function (destination) {
    var json = this.toJSON();
    delete json.nodes;
    delete json.revision;
    delete json.bypass;
    var params = JSON.stringify(json);
    return destination + '//' + params;
  },

  getNode: function (destination) {

    var nodes = this.nodes;

    var destinationId = this.getDestinationId(destination);
    var node = nodes[destinationId];

    if (!node) {
      node = nodes[destinationId] = this.createNode();
      this.configureNode(node);
    }

    return node;
  }
});
