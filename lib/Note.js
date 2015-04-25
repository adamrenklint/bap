var PositionModel = require('./PositionModel');
var rawKeys = ['position', 'key', 'duration', 'volume', 'pitch', 'pan'];
var numberInRangeType = require('./types/numberInRange');
var regexpType = require('./types/regexp');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var sampleParams = require('./mixins/sampleParams');

var Note = PositionModel.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, {

  type: 'note',

  props: {
    key: ['key', false],
    ghosts: ['array', true, function () { return []; }],
    transform: 'function'
  },

  dataTypes: {
    key: regexpType('key', /^(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)(\d+)$/),
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  start: function (time, ghost) {
    if (!this.mute) {
      this.trigger('start', time, ghost || this);
    }
  },

  stop: function (time, ghost) {
    this.trigger('stop', time, ghost || this);
  },

  runTransforms: function () {
    var cont = true;
    if (typeof this.transform === 'function') {
      cont = this.transform(this) === false ? false : true;
    }
    if (cont && this.collection && this.collection.parent && this.collection.parent.transform && typeof this.collection.parent.transform === 'function') {
      cont = this.collection.parent.transform(this) === false ? false : true;
    }
    if (cont && this.original && this.original.collection && this.original.collection.parent && this.original.collection.parent.transform && typeof this.original.collection.parent.transform === 'function') {
      cont = this.original.collection.parent.transform(this) === false ? false : true;
    }
    return this;
  },

  ghost: function (state) {
    var ghost = this.with(state);
    this.listenTo(ghost, 'start', this.start);
    this.listenTo(ghost, 'stop', this.stop);
    ghost.original = this;
    this.ghosts.push(ghost);
    return ghost;
  },

  detachGhosts: function () {
    if (this.original) {
      this.original.detachGhosts();
    }
    this.ghosts.forEach(function (ghost) {
      this.stopListening(ghost);
      ghost.original = null;
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
