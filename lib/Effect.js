var Model = require('./Model');

module.exports = Model.extend({

  type: 'effect',

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.node = this.createNode();
    this.on('change', this.configureNode);
    this.configureNode();
  },

  createNode: function () {
    throw new Error('createNode is not implemented for ' + this.type + ':' + this.cid);
  },

  configureNode: function () {},

  connect: function (destination) {
    this.node.connect(destination);
  },

  disconnect: function () {
    this.node.disconnect();
  }
});
