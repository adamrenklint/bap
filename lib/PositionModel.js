const Model = require('./Model');
const numberInRangeType = require('./types/numberInRange');
const regexpType = require('./types/regexp');
const padLeft = require('lodash.padleft');
const memoize = require('meemo');

const PositionModel = Model.extend({

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
    const fragments = this.fragments();
    const bar = this.bar || fragments[0];
    const beat = this.beat || fragments[1];
    let tick = this.tick || fragments[2];
    tick = tick < 10 && tick !== '00' ? `0${tick}` : tick;
    this.position = [bar, beat, tick].join('.');
  }
});

PositionModel.paddedPosition = memoize(position => {
  const length = 3;
  const fragments = PositionModel.fragments(position);
  return [
    padLeft(fragments[0], length, '0'),
    padLeft(fragments[1], length, '0'),
    padLeft(fragments[2], length, '0'),
  ].join('.');
});

PositionModel.fragments = memoize(position => position.split('.').map(n => {
  const num = parseInt(n, 10);
  return /^\d+$/.test(n) && !isNaN(num) ? num : n;
}));

const names = ['bar', 'beat', 'tick'];
PositionModel.getFragmentsObject = memoize(position => {
  const fragments = PositionModel.fragments(position);
  const values = {};
  fragments.forEach((fragment, index) => {
    if (fragment && typeof fragment === 'number' && !isNaN(fragment) && fragment > 0) {
      values[names[index]] = fragment;
    }
  });
  return values;
});

module.exports = PositionModel;
