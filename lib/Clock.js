var PositionModel = require('./PositionModel');
var Dilla = require('dilla');

var Clock = PositionModel.extend({

  type: 'clock',

  props: {
    playing: ['boolean', true, false]
  },

  initialize: function (options) {
    PositionModel.prototype.initialize.call(this);

    this.scheduler = new Dilla(this.context);
    this.scheduler.on('tick', this.onSchedulerTick.bind(this));
    this.scheduler.on('step', this.onSchedulerStep.bind(this));

    this.vent.on('clock:start', this.start.bind(this));
    this.on('change:playing', this.onChangePlaying.bind(this));
  },

  onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
  },

  start: function (sequence) {
    if (sequence) {
      this.schedule(sequence);
    }
    if (!this.playing) {
      this.scheduler.start();
      this.playing = true;
    }
  },

  schedule: function (sequence) {
    this.scheduler.setBeatsPerBar(sequence.beatsPerBar);
    this.scheduler.setLoopLength(sequence.bars);
    this.scheduler.set(sequence.cid, sequence.notes().map(function (note) {
      return [note.position, note];
    }));
  },

  onSchedulerTick: function (tick) {
    this.position = tick.position;
  },

  onSchedulerStep: function (step) {
    step.args[step.event](step.time);
  }
});

module.exports = Clock;
