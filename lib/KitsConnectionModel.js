var Model = require('./Model');
var Kit = require('./Kit');
var instanceOfType = require('./types/instanceOf');

var ids = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var props = {};
ids.forEach(function (id) {
  props[id] = 'kit';
});

var KitsConnectionModel = Model.extend({
  type: 'kitsConnection',
  props: props,
  dataTypes: {
    kit: instanceOfType('kit', Kit)
  },

  start: function (time, note, channel) {
    this._runEvent('start', time, note, channel);
  },

  stop: function (time, note, channel) {
    this._runEvent('stop', time, note, channel);
  },

  _runEvent: function (event, time, note, channel) {
    var kitId = note.key.slice(0, 1);
    var slotId = parseInt(note.key.slice(1), 10);
    var kit = this[kitId];
    if (kit && !kit.mute) {
      kit.slot(slotId)[event](time, note, channel);
    }
    else {
      console.warn('No kit found for ' + note.key, note);
    }
  }
});

module.exports = KitsConnectionModel;
