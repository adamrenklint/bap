var numberInRangeType = require('../types/numberInRange');

module.exports = {

  // props: {
  //   // frequency: ['inclusivePositiveNumber', true, 0],
  //   // shape: {
  //   //   type: 'string',
  //   //   default: 'sine',
  //   //   values: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
  //   }
  // },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
