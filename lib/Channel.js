var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');
var numberInRangeType = require('./types/numberInRange');

var Channel = Model.extend({

  type: 'channel',

  props: {
    volume: ['positiveNumber', true, 100],
    mute: ['boolean', true, false]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  collections: {
    notes: Collection.extend({
      model: Note
    })
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);

    this.notes.on('start', this.start.bind(this));
    this.notes.on('stop', this.stop.bind(this));
  },

  start: function (time, note) {
    time = time || this.context.currentTime;
    if (!this.mute) {
      this.trigger('start', time, note, this);
    }
  },

  stop: function (time, note) {
    time = time || this.context.currentTime;
    this.trigger('stop', time, note, this);
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return Note.fromRaw(raw);
    });
    this.notes.add(notes);
  }
});

module.exports = Channel;
