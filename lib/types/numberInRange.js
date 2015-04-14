function numberInRange (type, from, to) {

  return {
    set: function (newVal) {
      if (newVal >= from && newVal <= to) {
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
