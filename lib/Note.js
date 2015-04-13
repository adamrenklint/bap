var PositionModel = require('./PositionModel');
var rawKeys = ['position', 'key', 'duration', 'volume', 'pitch', 'pan'];
var numberInRangeType = require('./types/numberInRange');
var regexpType = require('./types/regexp');

var Note = PositionModel.extend({

  type: 'note',

  props: {
    key: 'key',
    duration: 'positiveNumber',
    volume: 'positiveNumber',
    pitch: 'number',
    pan: 'number',
    frequency: 'positiveNumber'
  },

  dataTypes: {
    key: regexpType('key', /^(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)(\d+)$/),
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  start: function (time) {
    time = time || this.context.currentTime;
    this.trigger('start', time, this);
  },

  stop: function (time) {
    time = time || this.context.currentTime;
    this.trigger('stop', time, this);
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
