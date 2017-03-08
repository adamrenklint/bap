const numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    volume: ['inclusivePositiveNumber', true, 100],
    mute: ['boolean', true, false],
    pan: ['panRange', true, 0]
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    panRange: numberInRangeType('panRange', -100, 100)
  }
};
