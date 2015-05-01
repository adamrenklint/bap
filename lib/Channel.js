var Model = require('./Model');
var Note = require('./Note');
var Collection = require('./Collection');
var volumeParams = require('./mixins/volumeParams');
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

    this._cache = {};

    this.listenTo(this.rawNotes, 'start', this._start);
    this.listenTo(this.rawNotes, 'stop', this._stop);
    this.listenTo(this.rawNotes, 'add', this._onAddRawNote);
    this.listenTo(this.rawNotes, 'remove', this._onRemoveRawNote);
    this.listenTo(this.rawNotes, 'change:position', this._onChangeRawNote);

    this.listenTo(this.expandedNotes, 'add', this._onAddExpandedNote);
    this.listenTo(this.expandedNotes, 'remove', this._onRemoveExpandedNote);

    this.cacheMethodUntilEvent('notes', 'change:expandedNotes');
  },

  add: function () {
    var notes = [].slice.call(arguments).map(function (raw) {
      return raw instanceof Note ? raw : Note.fromRaw(raw);
    });
    this.rawNotes.add(notes);
  },

  notes: function (bar, beat, tick) {
    if (!bar) return this.expandedNotes.models.slice();
    var cache = this._cache;
    var beats = cache[bar];
    if (!beat) return (beats && beats['*'] || []).slice();
    var ticks = beats && beats[beat];
    if (!tick) return (ticks && ticks['*'] || []).slice();
    return (ticks && ticks[tick] || []).slice();
  },

  _onAddExpandedNote: function (note) {
    var cache = this._cache;
    var bar = note.bar;
    var beat = note.beat;
    var tick = note.tick;

    cache[bar] = cache[bar] || {};
    cache[bar]['*'] = cache[bar]['*'] || [];
    cache[bar]['*'].push(note);
    cache[bar][beat] = cache[bar][beat] || {};
    cache[bar][beat]['*'] = cache[bar][beat]['*'] || [];
    cache[bar][beat]['*'].push(note);
    cache[bar][beat][tick] = cache[bar][beat][tick] || [];
    cache[bar][beat][tick].push(note);
  },

  _onRemoveExpandedNote: function (note) {
    var cache = this._cache;
    var bar = note.bar;
    var beat = note.beat;
    var tick = note.tick;

    var barIndex = cache[bar]['*'].indexOf(note);
    cache[bar]['*'].splice(barIndex, 1);
    var beatIndex = cache[bar][beat]['*'].indexOf(note);
    cache[bar][beat]['*'].splice(beatIndex, 1);
    var tickIndex = cache[bar][beat][tick].indexOf(note);
    cache[bar][beat][tick].splice(tickIndex, 1);
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
    this.expandedNotes.models.slice().forEach(function (ghost) {
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
