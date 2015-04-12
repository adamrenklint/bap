var PositionModel = require('./PositionModel');
var rawKeys = ['position', 'key', 'duration', 'volume', 'pitch', 'pan'];

var Note = PositionModel.extend({
  props: {
    key: 'string',
    duration: 'number',
    volume: 'number',
    pitch: 'number',
    pan: 'number'
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
