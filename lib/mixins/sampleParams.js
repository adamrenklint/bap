
var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    offset: ['inclusivePositiveNumber', true, 0],
    loop: ['inclusivePositiveNumber', true, 0],
    playbackRate: ['inclusivePositiveNumber', true, 1],
    channel: {
      type: 'any',
      // don't set a default value, because it wont all Params.fromSource to get the overriding value
      values: [null, false, undefined, 'left', 'right', 'merge', 'diff']
    },
    reverse: ['boolean', true, false]
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity)
  }
};
