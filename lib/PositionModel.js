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
      padLeft(this.bar || 0, length, '0'),
      padLeft(this.beat || 0, length, '0'),
      padLeft(this.tick || 0, length, '0'),
    ].join('.');
  },

  _updatePositionToFragments: function () {
    var fragments = this.position.split('.');
    ['bar', 'beat', 'tick'].forEach(function (key, index) {
      var n = parseInt(fragments[index], 10);
      this.set(key, isNaN(n) || n < 1 ? undefined : n, { silent: true });
    }.bind(this));
  },

  _updatePositionFromFragments: function () {
    var fragments = this.position.split('.');
    var bar = this.bar || fragments[0];
    var beat = this.beat || fragments[1];
    var tick = this.tick || fragments[2];
    tick = tick < 10 ? '0' + tick : tick;
    this.position = [bar, beat, tick].join('.');
  }
});

module.exports = PositionModel;
