var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');
var debounce = require('lodash.debounce');

var dillaOptions = {
  expandNote: function (note) {
    var ghost = note[1].ghost({ position: note[0] });
    note[1] = ghost.runTransforms();
    note[0] = note[1].position;
    return note;
  }
};

var Clock = PositionModel.extend({

  type: 'clock',

  props: {
    playing: ['boolean', true, false],
    sequence: 'sequenceInstance',
    lastScheduledPosition: 'string',
    stopByFold: 'boolean'
  },

  dataTypes: {
    sequenceInstance: instanceOfType('sequenceInstance', ['sequence', 'pattern'])
  },

  initialize: function () {
    PositionModel.prototype.initialize.call(this);

    this.on('change:playing', this.onChangePlaying);
    this.on('change:sequence', this.onChangeSequence);
    this.on('change:position', this.onChangePosition);

    this.scheduler = new Dilla(this.context, dillaOptions);
    // Dilla uses node/events on/addListener, which doesn't take context,
    // so need to bind this
    this.listenTo(this.scheduler, 'tick', this.onSchedulerTick.bind(this));
    this.listenTo(this.scheduler, 'step', this.onSchedulerStep.bind(this));

    this.listenTo(this.vent, 'clock:start', this.start);
    this.listenTo(this.vent, 'clock:pause', this.pause);
    this.listenTo(this.vent, 'clock:stop', this.stop);
    // this feels like a dirty way of using a global event bus :/
    this.listenTo(this.vent, 'clock:tempo', this.applySequenceTempo);
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
      old.detachGhosts();
    }
    this.bindAndTriggerSequenceAttribute('tempo', 'setTempo');
    this.bindAndTriggerSequenceAttribute('bars', 'setLoopLength');
    this.bindAndTriggerSequenceAttribute('beatsPerBar', 'setBeatsPerBar');

    this.listenTo(this.sequence, 'change:channels', debounce(function () {
      this.schedule(this.sequence, 'sequence');
    }));

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

  applySequenceTempo: function (target) {
    if (this.sequence) {
      target.tempo = this.sequence.tempo;
    }
  },

  onChangePosition: function () {
    if (this.position !== '0.0.00' && this.position !== this.scheduler._position) {
      this.scheduler.setPosition(this.position);
    }
  },

  start: function (sequence) {

    if (document.readyState === 'loading' || this.vent.loading) {
      return setTimeout(function () {
        this.start(sequence);
      }.bind(this), 10);
    }

    if (sequence) {
      if (this.sequence && this.sequence !== sequence) {
        this.sequence.playing = false;
      }
      this.sequence = sequence;
    }

    setTimeout(this.scheduler.start.bind(this.scheduler), 1);
    this.playing = true;

    // hack to avoid dropped notes, i.e. notes that were already scheduled
    // and played eagerly before a pause, and now needs to be scheduled again
    if (!sequence && this.sequence) {
      this.scheduler.setPosition(this.position);
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
      this.position = '1.1.01';
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

  foldingOverLoop: function (step) {
    var paddedPosition = step.args.paddedPosition();
    if (!this.sequence.loop && this.lastScheduledPosition && paddedPosition < this.lastScheduledPosition) {
      this.stopByFold = true;
      return true;
    }
    this.lastScheduledPosition = paddedPosition;
  },

  onSchedulerTick: function (tick) {
    if (this.stopByFold && tick.position > '1.1.00') {
      this.pause();
      this.stopByFold = false;
      this.lastScheduledPosition = null;
      this.tick = 96;
    }
    else if (tick.position !== '0.0.00') {
      this.position = tick.position;
    }
  },

  onSchedulerStep: function (step) {
    if (step.event === 'start' && !this.foldingOverLoop(step)) {
      step.args[step.event](step.time);
    }
  }
});

module.exports = Clock;
