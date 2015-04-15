var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    loaded: 'boolean',
    offset: ['inclusivePositiveNumber', true, 0],
    bufferLength: ['inclusivePositiveNumber', true, 0],
    buffer: 'any'
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
