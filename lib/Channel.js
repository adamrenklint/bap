var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');

var Channel = Model.extend({

  collections: {
    notes: Collection.extend({
      model: Note
    })
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return Note.fromRaw(raw);
    });
    this.notes.add(notes);
  }
});

module.exports = Channel;
