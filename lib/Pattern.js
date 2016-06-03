var PlayableModel = require('./PlayableModel');
var Channel = require('./Channel');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var volumeParams = require('./mixins/volumeParams');
var Kit = require('./Kit');
var numberInRangeType = require('./types/numberInRange');
var Sequence = require('./Sequence');
var sequenceActions = require('./utils/sequenceActions');

var Pattern = PlayableModel.extend(volumeParams, {

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
    var notes = [];
    this.channels.forEach(function (channel) {
      notes.push.apply(notes, channel.notes(bar, beat, tick));
    });
    return notes;
  },

  then: function () {
    var sequences = sequenceActions.then(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  after: function () {
    var sequences = sequenceActions.after(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  and: function () {
    var sequences = sequenceActions.and(this, arguments);
    return new Sequence({ sequences: sequences });
  },

  _start: function (time, note, channel) {
    this._runEvent('start', time, note, channel);
  },

  _stop: function (time, note, channel) {
    this._runEvent('stop', time, note, channel);
  },

  _runEvent: function (event, time, note, channel) {
    var kitId = parseInt(note.target.slice(0, 1), 10);
    var slotId = note.target.slice(1);
    var kit = this.kit(kitId);
    if (kit) {
      if (kit.mute) return;
      kit.slot(slotId)[event](time, note, channel, this, kit);
    }
    else {
      console.warn('No kit found for ' + note.target, note);
    }
  }

}, overloadedAccessor('channel', Channel), overloadedAccessor('kit', Kit));

module.exports = Pattern;
