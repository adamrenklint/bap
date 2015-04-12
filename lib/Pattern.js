var Model = require('./Model');
var Channel = require('./Channel');
var Collection = require('./Collection');
var OverloadedAccessor = require('./mixins/OverloadedAccessor');

var Pattern = Model.extend({

  type: 'pattern',
  
  props: {
    bars: ['number', true, 1],
    beatsPerBar: ['number', true, 4]
  },

  collections: {
    channels: Collection.extend({
      model: Channel
    })
  },

  start: function () {
    this.vent.trigger('clock:start', this);
  },

  notes: function () {
    var notes = [];
    this.channels.each(function (channel) {
      notes.push.apply(notes, channel.notes.models);
    });
    return notes;
  }

}, OverloadedAccessor('channel', Channel));

module.exports = Pattern;


//   this.params.tempo = this.params.tempo || 120;
//   this.params.bars = this.params.bars || 1;
//   this.params.beatsPerBar = this.params.beatsPerBar || 4;
