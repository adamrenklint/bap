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
  },

  _bumpRevision: function () {
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
    if (this.bypass) return false;

    var nodes = this.nodes;
    console.log('will create? %s > %s? ', this.type, destinationId, !!!nodes[destinationId]);
    var node = nodes[destinationId] = nodes[destinationId] || this.createNode();

    // seems like the combination of creating the effect nodes on the fly,
    // and configuring the node each time using it, is killing firefox perf
    if (node._lastConfiguredRevision !== this.revision) {
      this.configureNode(node);
      node._lastConfiguredRevision = this.revision;
    }

    return node;
  }
});
