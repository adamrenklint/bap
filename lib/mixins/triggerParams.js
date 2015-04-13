var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    duration: 'positiveNumber',
    length: 'inclusivePositiveNumber',
    attack: 'inclusivePositiveNumber',
    release: 'inclusivePositiveNumber',
    pitch: 'number'
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
