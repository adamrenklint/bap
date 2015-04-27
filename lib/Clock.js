var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');
var debounce = require('lodash.debounce');

var dillaOptions = {
  // when expanding Dilla position expressions, we need to clone the note
  // so that the original position (expression) is preserved
  expandNote: function (note) {
    if (note[1].ghost) {
      var ghost = note[1].ghost({ position: note[0] });
      note[1] = ghost.runTransforms();
      note[0] = note[1].position;
    }
    return note;
  }
};

var Clock = PositionModel.extend({

  type: 'clock',

  props: {
    playing: ['boolean', true, false],
    sequence: 'sequenceInstance',
    lastScheduledPosition: 'string',
    stopByFold: 'boolean',
    tempo: ['number', true, 0],
    step: 'function'
  },

  dataTypes: {
    sequenceInstance: instanceOfType('sequenceInstance', ['sequence', 'pattern'])
  },

  initialize: function () {
    PositionModel.prototype.initialize.call(this);
    this.on('change:playing', this._onChangePlaying);
    this.on('change:sequence', this._onChangeSequence);
    this.on('change:position', this._onChangePosition);
    this.on('change:tempo', this._onChangeTempo);

    this.scheduler = new Dilla(this.context, dillaOptions);
    // Dilla uses node/events on/addListener, which doesn't take context,
    // so need to bind this
    this.listenTo(this.scheduler, 'tick', this._onSchedulerTick.bind(this));
    this.listenTo(this.scheduler, 'step', this._onSchedulerStep.bind(this));

    this.listenTo(this.vent, 'clock:start', this.start);
    this.listenTo(this.vent, 'clock:pause', this.pause);
    this.listenTo(this.vent, 'clock:stop', this.stop);
    // this feels like a dirty way of using a global event bus :/
    this.listenTo(this.vent, 'clock:tempo', this._applySequenceTempo);
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

    // restarting a previously schedule sequence
    if (!sequence && this.sequence) {
      // hack to avoid dropped notes, i.e. notes that were already scheduled
      // and played eagerly before a pause, and now needs to be scheduled again
      this.scheduler.setPosition(this.position);
      // set the tempo before resuming playback
      this.scheduler.setTempo(this._findNextTempo());
    }
  },

  pause: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.scheduler.pause();
      this.playing = false;
      this.tempo = 0;
    }
  },

  stop: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.scheduler.stop();
      this.playing = false;
      this.position = '1.1.01';
      this.tempo = 0;
    }
  },

  _onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
    if (this.sequence) {
      this.sequence.playing = this.playing;
    }
  },

  _onChangeSequence: function () {
    var old = this._previousAttributes.sequence;
    if (old) {
      this.stopListening(old);
      old.detachGhosts();
    }

    if (this.sequence.type === 'pattern') {
      this._bindAndTriggerSequenceAttribute('tempo', 'setTempo');
      this._bindAndTriggerSequenceAttribute('bars', 'setLoopLength');
      this._bindAndTriggerSequenceAttribute('beatsPerBar', 'setBeatsPerBar');
    }

    var handleInternalSeqChange = debounce(function () {
      this._schedule(this.sequence, 'current');
    });

    this.listenTo(this.sequence, 'change:channels', handleInternalSeqChange);
    this.listenTo(this.sequence, 'change:sequences', handleInternalSeqChange);

    this._schedule(this.sequence, 'current');
    this.position = '1.1.01';
  },

  _onChangePosition: function () {
    if (this.position !== '0.0.00' && this.position !== this.scheduler._position) {
      this.scheduler.setPosition(this.position);
    }
  },

  _onChangeTempo: function () {
    if (this.tempo) {
      this.scheduler.setTempo(this.tempo);
    }
  },

  _onSchedulerTick: function (tick) {
    if (this.stopByFold && tick.position > '1.1.00') {
      this.pause();
      this.stopByFold = false;
      this.lastScheduledPosition = null;
      this.tick = 96;
    }
    else if (tick.position !== '0.0.00') {
      this.position = tick.position;
      this.tempo = this.scheduler.tempo();
    }
  },

  _onSchedulerStep: function (step) {
    if (step.id === 'current' && step.event === 'start' && !this._foldingOverLoop(step)) {
      if (!this.step || this.step(step.time, step.args) !== false) {
        step.args.start(step.time);
      }
    }
    else if (step.id === 'tempo' && (this.sequence.loop || step.args.position !== '1.1.01')) {
      this.scheduler.setTempo(step.args.val);
    }
  },

  _bindAndTriggerSequenceAttribute: function (key, setter) {
    var handler = function () {
      this.scheduler[setter](this.sequence[key]);
    }.bind(this);
    this.listenTo(this.sequence, 'change:' + key, handler);
    handler();
  },

  _applySequenceTempo: function (target) {
    target.tempo = this.scheduler.tempo();
  },

  // _runStepHandlers: function (time, step) {
  //   var cont = true;
  //   var handlers = this._stepHandlers.slice();
  //   var next;
  //   while (handlers.length && cont) {
  //     next = handlers.shift();
  //     cont = next(time, step) === false ? false : true;
  //   }
  //   return cont;
  // },

  _findNextTempo: function () {
    var current = this.position;
    var tempoChanges = this.scheduler.get('tempo').filter(function (change) {
      return change.position <= current;
    });
    var next = tempoChanges[tempoChanges.length - 1];
    return next && next.val || this.sequence.tempo || 120;
  },

  _schedule: function (sequence, name) {
    this.scheduler.setBeatsPerBar(sequence.beatsPerBar);
    this.scheduler.setLoopLength(sequence.bars);
    if (sequence.type === 'pattern') {
      this.scheduler.setTempo(sequence.tempo);
    }
    var start = new Date();
    this.scheduler.set(name, sequence.notes().map(function (note) {
      // console.log(note.position, note.cid, note.key);
      return [note.position, note];
    }));
    console.log('time: ' + (new Date() - start));

    this.scheduler.set('tempo', sequence.tempoChanges && sequence.tempoChanges() || []);
  },

  _foldingOverLoop: function (step) {
    var paddedPosition = step.args.paddedPosition();
    if (!this.sequence.loop && this.lastScheduledPosition && paddedPosition < this.lastScheduledPosition) {
      this.stopByFold = true;
      return true;
    }
    this.lastScheduledPosition = paddedPosition;
  }
});

module.exports = Clock;
