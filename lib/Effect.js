require('es6-object-assign').polyfill();

const Model = require('./Model');
const numberInRangeType = require('./types/numberInRange');

let Tuna, tuna;
if (global.window) {
  Tuna = require('tunajs');
}
else {
  Tuna = function () {};
}

module.exports = Model.extend({

  type: 'effect',

  props: {
    bypass: ['boolean', true, false],
    nodes: ['object', true, () => ({})]
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
    throw new Error(`Required method "createNode" is not implemented for ${this.cid}`);
  },

  configureNode: function (node) {
    throw new Error(`Required method "configureNode" is not implemented for ${this.cid}`);
  },

  combineNodes: function (input, output) {

    input.connect = destination => {
      output.connect(destination);
    };

    input.disconnect = () => {
      output.disconnect();
    };

    return input;
  },

  getDestinationId: function (destination) {
    const json = this.toJSON();
    delete json.nodes;
    delete json.revision;
    delete json.bypass;
    const params = JSON.stringify(json);
    return `${destination}//${params}`;
  },

  getNode: function (destination) {

    const nodes = this.nodes;

    const destinationId = this.getDestinationId(destination);
    let node = nodes[destinationId];

    if (!node) {
      node = nodes[destinationId] = this.createNode();
      this.configureNode(node);
    }

    return node;
  }
});
