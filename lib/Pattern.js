var Model = require('./Model');
var Channel = require('./Channel');
var Collection = require('./Collection');
var OverloadedAccessor = require('./mixins/OverloadedAccessor');

var Pattern = Model.extend({

  collections: {
    channels: Collection.extend({
      model: Channel
    })
  },

  start: function () {
    this.vent.trigger('clock:start', this);
  }

}, OverloadedAccessor('channel', Channel));

module.exports = Pattern;


//   this.params.tempo = this.params.tempo || 120;
//   this.params.bars = this.params.bars || 1;
//   this.params.beatsPerBar = this.params.beatsPerBar || 4;
