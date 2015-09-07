var Model = require('./Model');

module.exports = Model.extend({

  type: 'effect',

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.node = this.createNode();
    this.on('change', this.configureNode);
    this.configureNode();
  },

  createNode() {
    throw new Error('createNode is not implemented for ' + this.type + ':' + this.cid);
  },

  configureNode() {},

  connect: function (out) {
    this.node.connect(out);
  }
});
