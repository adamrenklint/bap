var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    frequency: 'frequencyRange',
    note: 'string',
    waveShape: 'array',
    waveTable: 'object',
    shape: {
      type: 'string',
      // default: 'sine',
      values: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
    }
  },

  dataTypes: {
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  }
};
