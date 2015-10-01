var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    duration: 'positiveNumber',
    length: 'inclusivePositiveNumber',
    attack: ['inclusivePositiveNumber', true, 0],
    release: ['releaseRange', true, 0.01],
    pitch: 'number'
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    releaseRange: numberInRangeType('releaseRange', 0.01, Infinity)
  }
};
