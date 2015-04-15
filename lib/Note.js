var PositionModel = require('./PositionModel');
var rawKeys = ['position', 'key', 'duration', 'volume', 'pitch', 'pan'];
var numberInRangeType = require('./types/numberInRange');
var regexpType = require('./types/regexp');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');

var Note = PositionModel.extend(triggerParams, volumeParams, oscillatorParams, {

  type: 'note',

  props: {
    key: ['key', false],
    ghosts: ['array', true, function () { return []; }]
  },

  dataTypes: {
    key: regexpType('key', /^(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)(\d+)$/),
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  start: function (time) {
    if (!this.mute) {
      this.trigger('start', time, this);
    }
  },

  stop: function (time) {
    this.trigger('stop', time, this);
  },

  ghost: function (state) {
    var newNote = this.with(state);
    this.listenTo(newNote, 'start', this.start);
    this.listenTo(newNote, 'stop', this.stop);
    this.ghosts.push(newNote);
    return newNote;
  },

  detachGhosts: function () {
    this.ghosts.forEach(function (ghost) {
      this.stopListening(ghost);
    }.bind(this));
    this.ghosts = [];
  }
});

Note.fromRaw = function (raw) {
  var attributes = {};
  var last = raw[raw.length - 1];
  if (typeof last === 'object' && last !== null) {
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
