var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');

var Channel = Model.extend({

  type: 'channel',

  collections: {
    notes: Collection.extend({
      model: Note
    })
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);

    this.notes.on('start', this.onStartNote.bind(this));
  },

  onStartNote: function (time, note) {
    this.trigger('start', time, note, this);
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return Note.fromRaw(raw);
    });
    this.notes.add(notes);
  }
});

module.exports = Channel;
