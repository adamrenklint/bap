var Model = require('./Model');

var PositionModel = Model.extend({

  props: {
    position: ['string', true, '0.0.00'],
    bar: ['number', false],
    beat: ['number', false],
    tick: ['number', false]
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);

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
      ['bar', 'beat', 'tick'].forEach(function (key, index) {
        var n = parseInt(fragments[index], 10);
        this[key] = isNaN(n) ? undefined : n;
      }.bind(this));
    }
  },

  updatePositionFromFragments: function () {
    if (this.bar && this.beat && this.tick) {
      var tick = this.tick < 10 ? '0' + this.tick : this.tick;
      this.position = [this.bar, this.beat, tick].join('.');
    }
  }
});

module.exports = PositionModel;
