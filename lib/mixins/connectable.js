module.exports = {

  props: {
    connections: ['array', true, function () { return []; }]
  },

  connect: function (node) {
    this.connections = this.connections.concat(node);
    return this;
  }
};
