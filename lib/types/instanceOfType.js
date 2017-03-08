function instanceOfType (type, types) {

  return {
    set: function (newVal) {
      if (~types.indexOf(newVal.type)) {
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
    compare: function (currentVal, newVal, attributeName) {
      const isSame = currentVal === newVal;
      if (!isSame) {
        if (currentVal) {
          this.stopListening(currentVal);
        }
        if (newVal !== null) {
          this.listenTo(newVal, 'all', this._getEventBubblingHandler(attributeName));
        }
      }
      return isSame;
    }
  };
}

module.exports = instanceOfType;
