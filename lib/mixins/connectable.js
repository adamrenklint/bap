module.exports = {

  props: {
    connections: ['array', true, () => []]
  },

  connect: function (node) {
    this.connections = this.connections.concat(node);
    return this;
  },

  disconnect: function (node) {
    if (Array.isArray(node)) {
      this.connections = this.connections.filter(connection => !~node.indexOf(connection));
    }
    else if (node) {
      this.connections = this.connections.filter(connection => node !== connection);
    }
    else {
      this.connections = [];
    }
    return this;
  }
};
