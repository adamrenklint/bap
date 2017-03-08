const Model = require('./Model');
const Note = require('./Note');
const Collection = require('./Collection');
const volumeParams = require('./mixins/volumeParams');
const connectable = require('./mixins/connectable');
const bypassable = require('./mixins/bypassable');
const expressions = require('dilla-expressions');

const NotesCollection = Collection.extend({
  model: Note
});

const Channel = Model.extend(volumeParams, bypassable, {

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

    this.listenTo(this.rawNotes, 'add', this._onAddRawNote);
    this.listenTo(this.rawNotes, 'remove', this._onRemoveRawNote);
    this.listenTo(this.rawNotes, 'change:position', this._onChangeRawNote);

    this.listenTo(this.expandedNotes, 'start', this._start);
    this.listenTo(this.expandedNotes, 'stop', this._stop);
    this.listenTo(this.expandedNotes, 'add', this._onAddExpandedNote);
    this.listenTo(this.expandedNotes, 'remove', this._onRemoveExpandedNote);

    this.cacheMethodUntilEvent('notes', 'change:expandedNotes');
  },

  add: function () {
    const notes = [].slice.call(arguments).map(raw => raw instanceof Note ? raw : Note.fromRaw(raw));
    this.rawNotes.add(notes);
    return this;
  },

  notes: function (bar, beat, tick) {
    if (!bar) return this.expandedNotes.models.slice();
    const cache = this._cache;
    const beats = cache[bar];
    if (!beat) return (beats && beats['*'] || []).slice();
    const ticks = beats && beats[beat];
    if (!tick) return (ticks && ticks['*'] || []).slice();
    return (ticks && ticks[tick] || []).slice();
  },

  transforms: function (note) {
    if (!note || !(note instanceof Note)) throw new Error('Invalid argument: note is not an instance of bap.note');
    const pattern = this.collection && this.collection.parent;

    const transforms = [];
    [note, this, pattern].forEach(source => {
      if (source && source.transform && typeof source.transform === 'function') {
        transforms.push(source.transform);
      }
    });

    if (!transforms.length) return false;

    return note => {
      transforms.forEach(fn => {
        fn(note);
      });
    };
  },

  _onAddExpandedNote: function (note) {
    const cache = this._cache;
    const bar = note.bar;
    const beat = note.beat;
    const tick = note.tick;

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
    const cache = this._cache;
    const bar = note.bar;
    const beat = note.beat;
    const tick = note.tick;

    const barIndex = cache[bar]['*'].indexOf(note);
    cache[bar]['*'].splice(barIndex, 1);
    const beatIndex = cache[bar][beat]['*'].indexOf(note);
    cache[bar][beat]['*'].splice(beatIndex, 1);
    const tickIndex = cache[bar][beat][tick].indexOf(note);
    cache[bar][beat][tick].splice(tickIndex, 1);
  },

  _onAddRawNote: function (note) {
    const transform = this.transforms(note);

    if (note.hasPlainPosition() && !transform) {
      note.original = note;
      return this.expandedNotes.add(note);
    }

    const pattern = this.collection && this.collection.parent;
    const options = {
      barsPerLoop: pattern && pattern.bars || 1,
      beatsPerBar: pattern && pattern.beatsPerBar || 4
    };

    expressions([[note.position]], options).forEach(position => {
      const expanded = note.with({ position: position[0] });
      expanded.original = note;
      transform && transform(expanded);
      this.expandedNotes.add(expanded);
    });
  },

  _onRemoveRawNote: function (note) {
    this.expandedNotes.models.slice().forEach(expanded => {
      if (note === expanded.original) {
        this.expandedNotes.remove(expanded);
        expanded.original = null;
      }
    });
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
}, connectable);

module.exports = Channel;
