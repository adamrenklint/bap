var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');
var volumeParams = require('./mixins/volumeParams');
// var debounce = require('lodash.debounce');
var expressions = require('dilla-expressions');

var NotesCollection = Collection.extend({
  model: Note
});

var Channel = Model.extend(volumeParams, {

  type: 'channel',

  props: {
    transform: 'function'
  },

  collections: {
    rawNotes: NotesCollection,
    expandedNotes: NotesCollection
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.listenTo(this.rawNotes, 'start', this._start);
    this.listenTo(this.rawNotes, 'stop', this._stop);

    this.listenTo(this.rawNotes, 'add', this._onAddRawNote);
    this.listenTo(this.rawNotes, 'remove', this._onRemoveRawNote);
    this.listenTo(this.rawNotes, 'change:position', this._onChangeRawNote);
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return raw instanceof Note ? raw : Note.fromRaw(raw);
    });
    this.rawNotes.add(notes);
  },

  _onAddRawNote: function (note) {
    var pattern = this.collection && this.collection.parent;
    var options = {
      barsPerLoop: pattern && pattern.bars || 1,
      beatsPerBar: pattern && pattern.beatsPerBar || 4
    };

    expressions([[note.position]], options).forEach(function (position) {
      var ghost = note.ghost({ position: position[0] });
      this.expandedNotes.add(ghost);
    }.bind(this));
  },

  _onRemoveRawNote: function (note) {
    this.expandedNotes.each(function (ghost) {
      if (note === ghost.original) {
        this.expandedNotes.remove(ghost);
        note.detachGhost(ghost);
      }
    }.bind(this));
  },

  _onChangeRawNote: function (note) {
    this._onRemoveRawNote(note);
    this._onAddRawNote(note);
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
