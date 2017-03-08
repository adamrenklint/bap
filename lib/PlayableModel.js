const Model = require('./Model');
const PlayableModel = Model.extend({

  type: 'playable-model',

  props: {
    playing: ['boolean', true, false]
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.on('change:playing', this._onChangePlaying.bind(this));
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
    this.notes(true).forEach(note => {
      note.detachGhosts();
    });
  },

  notes: function () {
    return [];
  },

  _onChangePlaying: function () {
    const method = this.playing ? 'start' : 'pause';
    this[method]();
  }
});

module.exports = PlayableModel;
