
var numberInRangeType = require('../types/numberInRange');

module.exports = {

  props: {
    src: 'string',
    offset: ['inclusivePositiveNumber', true, 0],
    loop: ['inclusivePositiveNumber', true, 0],
    bitcrush: ['bitRange', true, 0],
    bitcrushFrequency: ['frequencyRange', true, 6500],
    bitcrushMix: ['simpleCentRange', true, 0],
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
    simpleCentRange: numberInRangeType('simpleCentRange', 0, 100),
    frequencyRange: numberInRangeType('frequencyRange', 20, 22050)
  }
};
