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
    }
  };

}

module.exports = numberInRange;
