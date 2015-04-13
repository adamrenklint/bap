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
  },

  start: function (time, note, channel) {
    var kitId = note.key.slice(0, 1);
    var slotId = parseInt(note.key.slice(1), 10);
    var kit = this[kitId];
    if (kit) {
      kit.slot(slotId).start(time, note, channel);
    }
  },

  stop: function () {}
});

module.exports = KitsConnectionModel;
