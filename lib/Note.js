const PositionModel = require('./PositionModel');
const rawKeys = ['position', 'target', 'duration', 'volume', 'pitch', 'pan'];
const numberInRangeType = require('./types/numberInRange');
const regexpType = require('./types/regexp');
const triggerParams = require('./mixins/triggerParams');
const volumeParams = require('./mixins/volumeParams');
const oscillatorParams = require('./mixins/oscillatorParams');
const sampleParams = require('./mixins/sampleParams');
const connectable = require('./mixins/connectable');
const bypassable = require('./mixins/bypassable');

const Note = PositionModel.extend(triggerParams, volumeParams, oscillatorParams, sampleParams, connectable, bypassable, {

  type: 'note',

  props: {
    target: ['target', false],
    ghosts: ['array', true, () => []],
    transform: 'function',
    after: 'function',
    data: 'object'
  },

  dataTypes: {
    target: regexpType('target', /^(\d+)(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)$/),
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  },

  initialize: function () {
    PositionModel.prototype.initialize.apply(this, arguments);

    this.on('started', this._delegateStarted);
    this.on('stopped', this._delegateStopped);
  },

  _delegateStarted: function (note, params) {
    if (this.original && this.original !== this) {
      this.original.trigger('started', note, params);
    }
  },

  _delegateStopped: function (note, params) {
    if (this.original && this.original !== this) {
      this.original.trigger('stopped', note, params);
    }
  },

  start: function (time) {
    if (!this.mute) {
      this.trigger('start', time, this);
    }
  },

  stop: function (time) {
    this.trigger('stop', time, this);
  },

  hasPlainPosition: function () {
    return Note.isPlainPosition(this.position);
  }
});

const plainPositionRE = /^\d+\.\d+\.\d+$/;
Note.isPlainPosition = position => plainPositionRE.test(position);

Note.fromRaw = raw => {
  let attributes = {};
  const last = raw[raw.length - 1];
  if (typeof last === 'object' && last !== null) {
    attributes = raw.pop();
  }
  raw.forEach((value, index) => {
    const key = rawKeys[index];
    if (key && value) {
      attributes[key] = value;
    }
  });
  return new Note(attributes);
};

module.exports = Note;
