var Model = require('./Model');
var Channel = require('./Channel');
var Collection = require('./Collection');

var Pattern = Model.extend({

  collections: {
    channels: Collection.extend({
      model: Channel
    })
  },

  channel: function (id, channel) {

    var chained = false;
    if (!channel && id instanceof Channel) {
      channel = id;
      channel.id = this.channels.nextId();
      chained = true;
    }
    else if (id && !channel) {
      channel = this.channels.get(id) || new Channel({ id: id });
    }
    else if (id && channel instanceof Channel) {
      this.channels.remove(this.channels.get(id));
      channel.id = id;
      chained = true;
    }
    else if (!id || !channel) {
      channel = new Channel({ id: this.channels.nextId() });
    }

    this.channels.add(channel);
    return chained ? this : channel;
  }
});

module.exports = Pattern;


//   this.params.tempo = this.params.tempo || 120;
//   this.params.bars = this.params.bars || 1;
//   this.params.beatsPerBar = this.params.beatsPerBar || 4;
