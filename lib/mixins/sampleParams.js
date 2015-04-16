var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    offset: ['inclusivePositiveNumber', true, 0],
    channel: {
      type: 'string',
      // don't set a default value, because it wont all Params.fromSource to get the overriding value
      values: ['all', 'left', 'right']
    }
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
