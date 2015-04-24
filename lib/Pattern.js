var PlayableModel = require('./PlayableModel');
var Channel = require('./Channel');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var KitsConnectionModel = require('./KitsConnectionModel');
var numberInRangeType = require('./types/numberInRange');

var Pattern = PlayableModel.extend({

  type: 'pattern',

  props: {
    bars: ['positiveNumber', true, 1],
    beatsPerBar: ['positiveNumber', true, 4],
    tempo: ['positiveNumber', true, 120],
    loop: ['boolean', true, true]
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
    PlayableModel.prototype.initialize.apply(this, arguments);

    this.listenTo(this.channels, 'start', this.kits.start.bind(this.kits));
    this.listenTo(this.channels, 'stop', this.kits.stop.bind(this.kits));
  },

  notes: function () {
    var notes = [];
    this.channels.each(function (channel) {
      notes.push.apply(notes, channel.notes.models);
    });
    return notes;
  },

  kit: function (id, kit) {
    if (kit) {
      this.kits[id] = kit;
      return this;
    }
    else if (id) {
      return this.kits[id];
    }
  }

}, overloadedAccessor('channel', Channel));

module.exports = Pattern;
