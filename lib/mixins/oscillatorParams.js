const numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    frequency: 'frequencyRange',
    note: 'string',
    shape: {
      type: 'string',
      default: 'sine',
      values: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
    }
  },

  dataTypes: {
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  }
};
