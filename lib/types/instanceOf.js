function instanceOf (type, Constructor) {

  return {
    set: function (newVal) {
      if (newVal instanceof Constructor) {
        return {
          val: newVal,
          type: type
        };
      }
      else {
        return {
          val: newVal,
          type: typeof newVal
        };
      }
    },
    compare: function (currentVal, newVal) {
      return currentVal === newVal;
    }
  };
}

module.exports = instanceOf;
