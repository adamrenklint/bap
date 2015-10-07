module.exports = {

  props: {
    connections: ['array', true, function () { return []; }]
  },

  connect: function (node) {
    this.connections = this.connections.concat(node);
    return this;
  },

  disconnect: function (node) {
    if (Array.isArray(node)) {
      this.connections = this.connections.filter(function (connection) {
        return !~node.indexOf(connection);
      });
    }
    else if (node) {
      this.connections = this.connections.filter(function (connection) {
        return node !== connection;
      });
    }
    else {
      this.connections = [];
    }
    return this;
  }
};
