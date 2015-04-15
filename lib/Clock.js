var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');

var dillaOptions = {
  expandNote: function (note) {
    note[1] = note[1].ghost();
    return note;
  }
};

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
    this.on('change:position', this.onChangePosition.bind(this));

    this.scheduler = new Dilla(this.context, dillaOptions);
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
    var old = this._previousAttributes.sequence;
    if (old) {
      this.stopListening(old);
    }
    this.bindAndTriggerSequenceAttribute('tempo', 'setTempo');
    this.bindAndTriggerSequenceAttribute('bars', 'setLoopLength');
    this.bindAndTriggerSequenceAttribute('beatsPerBar', 'setBeatsPerBar');

    this.listenTo(this.sequence, 'change:channels', function (b, c) {
      this.schedule(this.sequence, 'sequence');
    });

    this.schedule(this.sequence, 'sequence');
    this.position = '1.1.01';
  },

  bindAndTriggerSequenceAttribute: function (key, setter) {
    var handler = function () {
      this.scheduler[setter](this.sequence[key]);
    }.bind(this);
    this.listenTo(this.sequence, 'change:' + key, handler);
    handler();
  },

  onChangePosition: function () {
    if (this.position !== '0.0.00' && this.position !== this.scheduler._position) {
      this.scheduler.setPosition(this.position);
    }
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

    // hack to avoid dropped notes, i.e. notes that were already scheduled
    // and played eagerly before a pause, and now needs to be scheduled again
    if (!sequence && this.sequence) {
      this.scheduler.setPosition(this.position)
    }
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
    this.scheduler.setTempo(sequence.tempo);
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
