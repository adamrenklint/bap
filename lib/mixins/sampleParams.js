var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    offset: ['inclusivePositiveNumber', true, 0]
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
