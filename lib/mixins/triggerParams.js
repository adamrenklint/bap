var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    duration: 'positiveNumber',
    length: 'inclusivePositiveNumber',
    attack: ['inclusivePositiveNumber', true, 0],
    release: ['inclusivePositiveNumber', true, 0],
    pitch: 'number'
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
