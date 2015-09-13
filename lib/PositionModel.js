var Model = require('./Model');
var numberInRangeType = require('./types/numberInRange');
var regexpType = require('./types/regexp');
var padLeft = require('lodash.padleft');
var memoize = require('meemo');

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
    return PositionModel.paddedPosition(this.position);
  },

  fragments: function () {
    return PositionModel.fragments(this.position);
  },

  _updatePositionToFragments: function () {
    this.set(PositionModel.getFragmentsObject(this.position));
  },

  _updatePositionFromFragments: function () {
    var fragments = this.fragments();
    var bar = this.bar || fragments[0];
    var beat = this.beat || fragments[1];
    var tick = this.tick || fragments[2];
    tick = tick < 10 && tick !== '00' ? '0' + tick : tick;
    this.position = [bar, beat, tick].join('.');
  }
});

PositionModel.paddedPosition = memoize(function (position) {
  var length = 3;
  var fragments = PositionModel.fragments(position);
  return [
    padLeft(fragments[0], length, '0'),
    padLeft(fragments[1], length, '0'),
    padLeft(fragments[2], length, '0'),
  ].join('.');
});

PositionModel.fragments = memoize(function (position) {
  return position.split('.').map(function (n) {
    var num = parseInt(n, 10);
    return /^\d+$/.test(n) && !isNaN(num) ? num : n;
  });
});

var names = ['bar', 'beat', 'tick'];
PositionModel.getFragmentsObject = memoize(function (position) {
  var fragments = PositionModel.fragments(position);
  var values = {};
  fragments.forEach(function (fragment, index) {
    if (fragment && typeof fragment === 'number' && !isNaN(fragment) && fragment > 0) {
      values[names[index]] = fragment;
    }
  });
  return values;
});

module.exports = PositionModel;
