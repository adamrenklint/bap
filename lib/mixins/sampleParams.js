
var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    offset: ['inclusivePositiveNumber', true, 0],
    loop: ['inclusivePositiveNumber', true, 0],
    bitcrush: ['bitRange', true, 0],
    bitcrushFreq: ['simpleFloatRange', true, 0],
    bitcrushMix: ['simpleFloatRange', true, 0],
    playbackRate: ['inclusivePositiveNumber', true, 1],
    channel: {
      type: 'any',
      // don't set a default value, because it wont all Params.fromSource to get the overriding value
      values: [null, false, undefined, 'left', 'right', 'merge', 'diff']
    },
    reverse: ['boolean', true, false]
  },

  dataTypes: {
    inclusivePositiveNumber: numberInRangeType('inclusivePositiveNumber', 0, Infinity),
    bitRange: numberInRangeType('bitRange', 0, 16),
    simpleFloatRange: numberInRangeType('simpleFloatRange', 0, 1)
  }
};
