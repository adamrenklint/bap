var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    frequency: 'positiveNumber',
    shape: {
      type: 'string',
      default: 'sine',
      values: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
    }
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  }
};
