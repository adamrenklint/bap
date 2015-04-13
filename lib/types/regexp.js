function numberInRange (type, regexp) {

  return {
    set: function (newVal) {
      if (regexp.test(newVal)) {
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

module.exports = numberInRange;
