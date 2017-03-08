const types = [
  'compressor',
  'delay',
  'filter',
  'overdrive',
  'reverb'
];

module.exports = {

  props: {
    bypass: ['bypassType', true, false]
  },

  dataTypes: {
    bypassType: {
      set: function (newVal) {
        if (typeof newVal === 'boolean' || ~types.indexOf(newVal)) {
          return { val: newVal, type: 'bypassType' };
        }
        else if (Array.isArray(newVal)) {
          const invalid = !!newVal.filter(possibleType => !~types.indexOf(possibleType)).length;
          if (invalid) {
            return { val: newVal, type: typeof newVal };
          }
          else {
            return { val: newVal, type: 'bypassType' };
          }
        }
        else {
          return { val: newVal, type: typeof newVal };
        }
      }
    }
  }
};
