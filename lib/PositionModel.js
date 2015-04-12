var Model = require('./Model');

var PositionModel = Model.extend({

  props: {
    position: ['string', true, '0.0.00'],
    bar: ['number', true],
    beat: ['number', true],
    tick: ['number', true]
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
      this.bar = parseInt(fragments[0], 10);
      this.beat = parseInt(fragments[1], 10);
      this.tick = parseInt(fragments[2], 10);
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
