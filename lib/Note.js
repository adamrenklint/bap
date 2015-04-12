var State = require('ampersand-state');
var rawKeys = ['position', 'key', 'duration', 'volume', 'pitch', 'pan'];

var Note = State.extend({

  props: {
    position: 'string',
    bar: 'number',
    beat: 'number',
    tick: 'number',
    key: 'string',
    duration: 'number',
    volume: 'number',
    pitch: 'number',
    pan: 'number'
  },

  initialize: function () {
    State.prototype.initialize.apply(this, arguments);

    this.on('change:position', this.updatePositionToFragments);
    this.on('change:bar', this.updatePositionFromFragments);
    this.on('change:beat', this.updatePositionFromFragments);
    this.on('change:tick', this.updatePositionFromFragments);

    this.updatePositionToFragments();
    this.updatePositionFromFragments();
  },

  updatePositionToFragments: function () {
    if (this.position) {
      var fragments = this.position.split('.');
      this.bar = parseInt(fragments[0], 10);
      this.beat = parseInt(fragments[1], 10);
      this.tick = parseInt(fragments[2], 10);
    }
  },

  updatePositionFromFragments: function () {
    if (this.bar && this.beat && this.tick) {
      var tick = this.tick < 10 ? '0' + this.tick : this.tick;
      this.position = [this.bar, this.beat, tick].join('.');
    }
  }
});

Note.fromRaw = function (raw) {
  var attributes = {};
  if (typeof raw[raw.length - 1] === 'object') {
    attributes = raw.pop();
  }
  raw.forEach(function (value, index) {
    var key = rawKeys[index];
    if (key && value) {
      attributes[key] = value;
    }
  });
  return new Note(attributes);
};

module.exports = Note;
