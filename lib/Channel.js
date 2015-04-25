var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');
var volumeParams = require('./mixins/volumeParams');

var Channel = Model.extend(volumeParams, {

  type: 'channel',

  props: {
    transform: 'function'
  },

  collections: {
    notes: Collection.extend({
      model: Note
    })
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.notes.on('start', this._start.bind(this));
    this.notes.on('stop', this._stop.bind(this));
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return raw instanceof Note ? raw : Note.fromRaw(raw);
    });
    this.notes.add(notes);
  },

  _start: function (time, note) {
    if (!this.mute) {
      this.trigger('start', time, note, this);
    }
  },

  _stop: function (time, note) {
    this.trigger('stop', time, note, this);
  }
});

module.exports = Channel;
