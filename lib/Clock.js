var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');

var Clock = PositionModel.extend({

  type: 'clock',

  props: {
    playing: ['boolean', true, false],
    sequence: 'sequenceInstance'
  },

  dataTypes: {
    sequenceInstance: instanceOfType('sequenceInstance', ['sequence', 'pattern'])
  },

  initialize: function (options) {
    PositionModel.prototype.initialize.call(this);

    this.on('change:playing', this.onChangePlaying.bind(this));
    this.on('change:sequence', this.onChangeSequence.bind(this));

    this.scheduler = new Dilla(this.context);
    this.scheduler.on('tick', this.onSchedulerTick.bind(this));
    this.scheduler.on('step', this.onSchedulerStep.bind(this));

    this.vent.on('clock:start', this.start.bind(this));
    this.vent.on('clock:pause', this.pause.bind(this));
    this.vent.on('clock:stop', this.stop.bind(this));
  },

  onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
    if (this.sequence) {
      this.sequence.playing = this.playing;
    }
  },

  onChangeSequence: function () {
    this.schedule(this.sequence, 'sequence');
    this.scheduler.setPosition('1.1.01')
  },

  start: function (sequence) {
    if (sequence) {
      if (this.sequence && this.sequence !== sequence) {
        this.sequence.playing = false;
      }
      this.sequence = sequence;
    }

    this.scheduler.start();
    this.playing = true;
  },

  pause: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.scheduler.pause();
      this.playing = false;
    }
  },

  stop: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.scheduler.stop();
      this.playing = false;
      // do this right away, or wait until next start?
      // this.position = '1.1.01';
    }
  },

  schedule: function (sequence, name) {
    this.scheduler.setBeatsPerBar(sequence.beatsPerBar);
    this.scheduler.setLoopLength(sequence.bars);
    this.scheduler.set(name, sequence.notes().map(function (note) {
      return [note.position, note];
    }));
  },

  onSchedulerTick: function (tick) {
    this.position = tick.position;
  },

  onSchedulerStep: function (step) {
    if (step.event === 'start') {
      step.args[step.event](step.time);
    }
  }
});

module.exports = Clock;
