var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');
var regexpType = require('./types/regexp');
var padLeft = require('lodash.padleft');

var PositionModel = Model.extend({

  type: 'position-model',

  props: {
    position: ['position', true, '0.0.00'],
    bar: ['positiveNumber', false],
    beat: ['positiveNumber', false],
    tick: ['tick', false]
  },

  dataTypes: {
    position: regexpType('position', /^(.+)\.(.+)\.(.+)$/),
    positiveNumber: numberInRangeType('positiveNumber', 1, Infinity),
    tick: numberInRangeType('tick', 1, 96)
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);

    this.on('change:position', this._updatePositionToFragments);
    this.on('change:bar', this._updatePositionFromFragments);
    this.on('change:beat', this._updatePositionFromFragments);
    this.on('change:tick', this._updatePositionFromFragments);

    this._updatePositionToFragments();
    this._updatePositionFromFragments();
  },

  paddedPosition: function () {
    var length = 5;
    return [
      padLeft(this.bar, length, '0'),
      padLeft(this.beat, length, '0'),
      padLeft(this.tick, length, '0'),
    ].join('.');
  },

  _updatePositionToFragments: function () {
    if (this.position) {
      var fragments = this.position.split('.');
      ['bar', 'beat', 'tick'].forEach(function (key, index) {
        var n = parseInt(fragments[index], 10);
        this.set(key, isNaN(n) || n < 1 ? undefined : n, { silent: true });
      }.bind(this));
    }
  },

  _updatePositionFromFragments: function () {
    if (this.bar && this.beat && this.tick) {
      var tick = this.tick < 10 ? '0' + this.tick : this.tick;
      this.position = [this.bar, this.beat, tick].join('.');
    }
  }
});

module.exports = PositionModel;
