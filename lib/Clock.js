var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');
var debounce = require('lodash.debounce');
var memoize = require('lodash.memoize');

var getSteps = memoize(function (bar, beat, bars, beats) {

  var steps = [];

  function push () {
    var tick = 0;
    while (++tick < 97) {
      steps.push([bar, beat, tick < 10 ? '0' + tick : tick].join('.'));
    }
  }
  push();

  if (++beat > beats) {
    beat = 1;
    if (++bar > bars) {
      bar = 1;
    }
  }
  push();

  return steps;
}, function () {
  return [].slice.call(arguments).join('//');
});

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

    this.on('change:bar', this._scheduleSteps);
    this.on('change:beat', this._scheduleSteps);

    this.engine = new Dilla(this.context);
    // Dilla uses node/events on/addListener,
    // which doesn't take context, so need to bind this
    this.listenTo(this.engine, 'tick', this._onEngineTick.bind(this));
    this.listenTo(this.engine, 'step', this._onEngineStep.bind(this));
    // Dilla also does not have an off method, so need to bind alias
    this.engine.off = this.engine.removeAllListeners.bind(this.engine);

    this.listenTo(this.vent, 'clock:start', this.start);
    this.listenTo(this.vent, 'clock:pause', this.pause);
    this.listenTo(this.vent, 'clock:stop', this.stop);
    // TODO: remove this hack: a dirty way of using a global event bus :/
    this.listenTo(this.vent, 'clock:tempo', this._applySequenceTempo);
  },

  canStartPlaying: function () {
    return global.document.readyState !== 'loading' && !this.vent.loading;
  },

  start: function (sequence) {

    if (!this.canStartPlaying()) {
      return setTimeout(function () {
        this.start(sequence);
      }.bind(this), 10);
    }

    this.sequence = sequence || this.sequence;

    setTimeout(this.engine.start.bind(this.engine), 1);
    this.playing = true;
  //
  //   // restarting a previously schedule sequence
    // if (!sequence && this.sequence) {
    //   // hack to avoid dropped notes, i.e. notes that were already scheduled
    //   // and played eagerly before a pause, and now needs to be scheduled again
    //   this.scheduler.setPosition(this.position);
  //     // set the tempo before resuming playback
  //     this.scheduler.setTempo(this._findNextTempo());
    // }
  },

  pause: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.engine.pause();
      this.playing = false;
      this.tempo = 0;
    }
  },

  stop: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.engine.stop();
      this.playing = false;
      this.position = '1.1.01';
      this.tempo = 0;
    }
  },

  _scheduleSteps: function () {
    var steps = this._lookaheadSteps();
    this.engine.set('lookahead', steps.map(function (step) {
      return [step];
    }));
  },

  _lookaheadSteps: function () {
    var bar = this.bar;
    var beat = this.beat;
    var beatsPerBar = this.sequence && this.sequence.beatsPerBar || 4;
    var bars = this.sequence && this.sequence.bars || 1;
    return getSteps(bar, beat, bars, beatsPerBar);
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
    }

    this.listenTo(this.sequence, 'change:bars', this._onChangeSequence);
    this.listenTo(this.sequence, 'change:beatsPerBar', this._onChangeSequence);

    // TODO: still need to listen for note changes, and keep current tempo and tempo changes up to date...
    // this.listenTo(this.sequence, 'change:channels', this._scheduleSteps);
    // this.listenTo(this.sequence, 'change:sequences', this._scheduleSteps);

    this._scheduleSteps();
    this.engine.setBeatsPerBar(this.sequence.beatsPerBar);
    this.engine.setLoopLength(this.sequence.bars);
  },

  _onChangePosition: function () {
    if (this.position !== '0.0.00' && this.position !== this.engine._position) {
      this.engine.setPosition(this.position);
    }
  },

  _onChangeTempo: function () {
    if (this.tempo) {
      this.engine.setTempo(this.tempo);
    }
  },

  _onEngineTick: function (tick) {
    if (tick.position !== '0.0.00') {
      this.position = tick.position;
    }
  },

  _onEngineStep: function (step) {
    if (step.id === 'lookahead') {
      this._queueNotes(step.position, step.time);
    }
  },

  _queueNotes: function (position, time) {
    if (!this.sequence) { return; }

    var fragments = position.split('.').map(function (n) {
      return parseInt(n, 10);
    });

    var notes = this.sequence.notes(fragments[0], fragments[1], fragments[2]);
    notes = Array.isArray(notes) ? notes : notes[fragments[0]];

    notes.forEach(function (note) {
      note.start(time);
    });
  },

  _applySequenceTempo: function (target) {
    // this is very strange, still
    // and clock.tempo is potentially out of date
    // NEED TO MAKE THIS FLOW CONCRETE, and TEST IT
    target.tempo = this.engine.tempo();
  }


    // _onSchedulerTick: function (tick) {
    //   if (this.stopByFold && tick.position > '1.1.00') {
    //     this.pause();
    //     this.stopByFold = false;
    //     this.lastScheduledPosition = null;
    //     this.tick = 96;
    //   }
    //   else if (tick.position !== '0.0.00') {
    //     var bar = this.bar;
    //     this.position = tick.position;
    //     if (this.bar !== bar) {
    //       this.trigger('change:bar');
    //     }
    //     this.tempo = this.scheduler.tempo();
    //   }
    // },
    //
    // _onSchedulerStep: function (step) {
    //   if (step.id === 'current' && step.event === 'start' && !this._foldingOverLoop(step)) {
    //     if (!this.step || this.step(step.time, step.args) !== false) {
    //       step.args.start(step.time);
    //     }
    //   }
    //   else if (step.id === 'tempo' && (this.sequence.loop || step.args.position !== '1.1.01')) {
    //     this.scheduler.setTempo(step.args.val);
    //   }
    // },
    //
    // _bindAndTriggerSequenceAttribute: function (key, setter) {
    //   var handler = function () {
    //     this.scheduler[setter](this.sequence[key]);
    //   }.bind(this);
    //   this.listenTo(this.sequence, 'change:' + key, handler);
    //   handler();
    // },
    //

  // // _runStepHandlers: function (time, step) {
  // //   var cont = true;
  // //   var handlers = this._stepHandlers.slice();
  // //   var next;
  // //   while (handlers.length && cont) {
  // //     next = handlers.shift();
  // //     cont = next(time, step) === false ? false : true;
  // //   }
  // //   return cont;
  // // },
  //
  // _findNextTempo: function () {
  //   var current = this.position;
  //   var tempoChanges = this.scheduler.get('tempo').filter(function (change) {
  //     return change.position <= current;
  //   });
  //   var next = tempoChanges[tempoChanges.length - 1];
  //   return next && next.val || this.sequence.tempo || 120;
  // },
  //
  // _schedule: debounce(function (sequence, name) {

  //
  //   // console.log('SCHEDULE\n=============\ncurrent bar:', this.bar, 'seq length:', sequence.bars);
  //   var from = this.bar;
  //   var to = this.bar + 1;
  //   if (to > sequence.bars) {
  //     to = 1;
  //   }
  //   var start = new Date();
  //
  //   var notes = sequence.notes(false, [from, to]).map(function (note) {
  //     // console.log(note.position, note.cid, note.key);
  //     return [note.position, note];
  //   });
  //   this.scheduler.set(name, notes);
  //   // console.log('between', from, to, '=>', notes.length);
  //   // console.log('time: ' + (new Date()  - start) + '\n-----------');
  //
  //   this.scheduler.set('tempo', sequence.tempoChanges && sequence.tempoChanges() || []);
  // }),
  //
  // _foldingOverLoop: function (step) {
  //   var paddedPosition = step.args.paddedPosition();
  //   if (!this.sequence.loop && this.lastScheduledPosition && paddedPosition < this.lastScheduledPosition) {
  //     this.stopByFold = true;
  //     return true;
  //   }
  //   this.lastScheduledPosition = paddedPosition;
  // }
});

module.exports = Clock;
