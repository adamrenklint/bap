var Model = require('./Model');

module.exports = Model.extend({

  type: 'effect',

  props: {
    nodes: ['object', true, function () { return {}; }]
  },

  createNode: function () {
    throw new Error('Required method "createNode" is not implemented for ' + this.cid);
  },

  configureNode: function (node) {
    throw new Error('Required method "configureNode" is not implemented for ' + this.cid);
  },

  getNode: function (destinationId) {
    var nodes = this.nodes;
    var node = nodes[destinationId] = nodes[destinationId] || this.createNode();
    this.configureNode(node);
    return node;
  }
});
