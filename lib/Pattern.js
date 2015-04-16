var Model = require('./Model');
var Channel = require('./Channel');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var KitsConnectionModel = require('./KitsConnectionModel');
var numberInRangeType = require('./types/numberInRange');

var Pattern = Model.extend({

  type: 'pattern',

  props: {
    playing: ['boolean', true, false],
    bars: ['positiveNumber', true, 1],
    beatsPerBar: ['positiveNumber', true, 4],
    tempo: ['positiveNumber', true, 120]
  },

  dataTypes: {
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  collections: {
    channels: Collection.extend({
      model: Channel
    })
  },

  children: {
    kits: KitsConnectionModel
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);

    this.on('change:playing', this.onChangePlaying.bind(this));

    this.listenTo(this.channels, 'start', this.kits.start.bind(this.kits));
    this.listenTo(this.channels, 'stop', this.kits.stop.bind(this.kits));
  },

  onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
  },

  start: function () {
    this.playing = true;
    this.vent.trigger('clock:start', this);
  },

  pause: function () {
    this.playing = false;
    this.vent.trigger('clock:pause', this);
  },

  stop: function () {
    this.playing = false;
    this.vent.trigger('clock:stop', this);
  },

  detachGhosts: function () {
    this.notes().forEach(function (note) {
      note.detachGhosts();
    });
  },

  notes: function () {
    var notes = [];
    this.channels.each(function (channel) {
      notes.push.apply(notes, channel.notes.models);
    });
    return notes;
  },

  use: function (id, kit) {
    this.kits[id] = kit;
    return this;
  }

}, overloadedAccessor('channel', Channel));

module.exports = Pattern;
