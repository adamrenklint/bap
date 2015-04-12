var Model = require('./Model');
var Kit = require('./Kit');

var ids = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var props = {};
ids.forEach(function (id) {
  props[id] = 'kit';
});

var KitsConnectionModel = Model.extend({
  type: 'kitsConnection',
  props: props,
  dataTypes: {
    kit: {
      set: function (newVal) {
        if (newVal instanceof Kit) {
          return {
            val: newVal,
            type: 'kit'
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
    }
  }
});

module.exports = KitsConnectionModel;
