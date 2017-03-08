const PlayableModel = require('./PlayableModel');
const Channel = require('./Channel');
const Collection = require('./Collection');
const overloadedAccessor = require('./mixins/overloadedAccessor');
const volumeParams = require('./mixins/volumeParams');
const Kit = require('./Kit');
const numberInRangeType = require('./types/numberInRange');
const Sequence = require('./Sequence');
const sequenceActions = require('./utils/sequenceActions');

const Pattern = PlayableModel.extend(volumeParams, {

  type: 'pattern',

  props: {
    bars: ['positiveNumber', true, 1],
    beatsPerBar: ['positiveNumber', true, 4],
    tempo: ['positiveNumber', true, 120],
    loop: ['boolean', true, true],
    pitch: 'number'
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    volumeRange: numberInRangeType('volumeRange', 0, 999)
  },

  collections: {
    channels: Collection.extend({
      model: Channel
    }),
    kits: Collection.extend({
      model: Kit
    })
  },

  initialize: function () {
    PlayableModel.prototype.initialize.apply(this, arguments);

    this.listenTo(this.channels, 'start', this._start);
    this.listenTo(this.channels, 'stop', this._stop);

    this.cacheMethodUntilEvent('notes', 'change:channels');
  },

  notes: function (bar, beat, tick) {
    const notes = [];
    this.channels.forEach(channel => {
      notes.push.apply(notes, channel.notes(bar, beat, tick));
    });
    return notes;
  },

  then: function () {
    const sequences = sequenceActions.then(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  after: function () {
    const sequences = sequenceActions.after(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  and: function () {
    const sequences = sequenceActions.and(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  _start: function (time, note, channel) {
    this._runEvent('start', time, note, channel);
  },

  _stop: function (time, note, channel) {
    this._runEvent('stop', time, note, channel);
  },

  _runEvent: function (event, time, note, channel) {
    const kitId = parseInt(note.target.slice(0, 1), 10);
    const slotId = note.target.slice(1);
    const kit = this.kit(kitId);
    if (kit) {
      if (kit.mute) return;
      kit.slot(slotId)[event](time, note, channel, this, kit);
    }
    else {
      console.warn(`No kit found for ${note.target}`, note);
    }
  }

}, overloadedAccessor('channel', Channel), overloadedAccessor('kit', Kit));

module.exports = Pattern;
