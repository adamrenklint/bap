require('es6-object-assign').polyfill();

var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');

module.exports = Model.extend({

  type: 'effect',

  props: {
    bypass: ['boolean', true, false],
    nodes: ['object', true, function () { return {}; }],
    revision: ['number', true, 1]
  },

  dataTypes: {
    volumeRange: numberInRangeType('volumeRange', 0, 999),
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.on('change', this._bumpRevision);
    // this.nodes.destination = this.createNode();
  },

  _bumpRevision: function () {
    console.log('bumpRevision');
    this.set({ revision: this.revision + 1 }, { silent: true });
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
    console.log('will create? %s > %s? ', this.cid, destinationId, !!!nodes[destinationId]);
    var node = nodes[destinationId] = nodes[destinationId] || this.createNode();

    if (this.bypass) {
      node.disconnect();
      return false;
    }

    if (node._lastConfiguredRevision !== this.revision) {
      console.log('configure', this.cid)
      this.configureNode(node);
      node._lastConfiguredRevision = this.revision;
    }

    return node;
  }
});
