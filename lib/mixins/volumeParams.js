var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    volume: ['positiveNumber', true, 100],
    mute: ['boolean', true, false],
    pan: ['panRange', true, 0]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    panRange: numberInRangeType('panRange', -100, 100)
  }
};
