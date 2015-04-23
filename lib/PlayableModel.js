var Model = require('./Model');
var PlayableModel = Model.extend({

  type: 'playable-model',

  props: {
    playing: ['boolean', true, false]
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.on('change:playing', this.onChangePlaying.bind(this));
  },

  onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
  },

  start: function () {
    this.playing = true;
    this.vent.trigger('clock:start', this);
    return this;
  },

  pause: function () {
    this.playing = false;
    this.vent.trigger('clock:pause', this);
    return this;
  },

  stop: function () {
    this.playing = false;
    this.vent.trigger('clock:stop', this);
    return this;
  },

  detachGhosts: function () {
    this.notes().forEach(function (note) {
      console.log('detach', note.cid);
      note.detachGhosts();
    });
  },

  notes: function () {
    return [];
  }
});

module.exports = PlayableModel;
