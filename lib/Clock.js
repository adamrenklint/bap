var PositionModel = require('./PositionModel');
var Dilla = require('dilla');
var instanceOfType = require('./types/instanceOfType');
var debounce = require('lodash.debounce');
var memoize = require('lodash.memoize');

var Clock = PositionModel.extend({

  type: 'clock',

  props: {
    playing: ['boolean', true, false],
    sequence: 'sequenceInstance',
    tempo: ['number', true, 0],
    step: 'function',
    _lastQueuedPosition: ['string', true, '0.0.00'],
    _stopByFold: 'boolean'
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

  _canStartPlaying: function () {
    return global.document.readyState !== 'loading' && !this.vent.loading;
  },

  start: function (sequence) {

    if (!this._canStartPlaying()) {
      return setTimeout(function () {
        this.start(sequence);
      }.bind(this), 10);
    }

    if (sequence) {
      this.sequence = sequence;
    }

    if (this._stopByFold) {
      this.position = '1.1.01';
      this._stopByFold = false;
    }

    setTimeout(this.engine.start.bind(this.engine), 1);
    this.playing = true;

    // restarting a previously schedule sequence
    if (!sequence && this.sequence && this.position !== '0.0.00') {
      // hack to avoid dropped notes, i.e. notes that were already scheduled
      // and played eagerly before a pause, and now needs to be scheduled again
      this._lastQueuedPosition = this.position;
      this.engine.setPosition(this.position);
      this._updateTempo(this.position);
    }
  },

  pause: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.engine.pause();
      this.playing = false;
      this.tempo = 0;
      this._lastQueuedPosition = '0.0.00';
    }
  },

  stop: function (sequence) {
    if (!sequence || sequence === this.sequence) {
      this.engine.stop();
      this.playing = false;
      this.position = '1.1.01';
      this.tempo = 0;
      this._lastQueuedPosition = '0.0.00';
    }
  },

  _scheduleSteps: function () {
    var steps = this._lookaheadSteps();
    this.engine.set('lookahead', steps.map(function (step) {
      return [step];
    }));
  },

  _lookaheadSteps: function () {
    var bar = this.bar || 1;
    var beat = this.beat || 1;
    var beatsPerBar = this.sequence && this.sequence.beatsPerBar || 4;
    var bars = this.sequence && this.sequence.bars || 1;
    return Clock.possibleSteps(bar, beat, bars, beatsPerBar);
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

    this.engine.setBeatsPerBar(this.sequence.beatsPerBar);
    this.engine.setLoopLength(this.sequence.bars);
    this.tempo = this.sequence.tempo;
    this._scheduleSteps();
  },

  _onChangePosition: function () {
    if (this.position !== '0.0.00' && this.position !== this.engine._position) {
      this.engine.setPosition(this.position);
    }
  },

  _onChangeTempo: function () {
    this.engine.setTempo(this.tempo);
  },

  _onEngineTick: function (tick) {
    if (!this.playing || tick.position === '0.0.00') {
      return;
    }
    else if (this._stopByFold) {
      this.pause();
      this.tick = 96;
    }
    else {
      this.position = tick.position;
      this.tempo = this.engine.tempo();
    }
  },

  _onEngineStep: function (step) {
    if (!this.playing) {
      return;
    }
    else if (step.id === 'lookahead' && !this._foldingOverLoop(step.position)) {
      this._updateTempo(step.position);
      this._queueNotesForStep(step.position, step.time);
      this._lastQueuedPosition = step.position;
    }
  },

  _updateTempo: function (position) {
    if (!this.sequence) {
      this.tempo = 120;
    }
    else if (position && this.sequence.tempoAt) {
      var fragments = Clock.fragments(position);
      var ticks = Clock.ticksForTempoChange(this.tempo);
      var shouldLookAhead = fragments[2] >= (96 - ticks) && fragments[1] === this.sequence.beatsPerBar;
      var checkBar = shouldLookAhead ? fragments[0] + 1 : fragments[0];
      if (checkBar > this.sequence.bars && this.sequence.loop) {
        checkBar = 1;
      }
      this.tempo = this.sequence.tempoAt(checkBar);
    }
    else {
      this.tempo = this.sequence.tempo;
    }
  },

  _foldingOverLoop: function (position) {
    var previous = Clock.paddedPosition(this._lastQueuedPosition);
    var next = Clock.paddedPosition(position);
    this._stopByFold = !this.sequence.loop && next < previous;
    return this._stopByFold;
  },

  _queueNotesForStep: function (position, time) {
    if (!this.sequence) { return; }

    var fragments = Clock.fragments(position);
    var notes = this.sequence.notes(fragments[0], fragments[1], fragments[2]);
    notes = Array.isArray(notes) ? notes : notes[fragments[0]];

    var step = typeof this.step === 'function' ? this.step : null;

    notes.forEach(function (note) {
      if (!step || step && step(note, time) !== false) {
        note.start(time);
      }
    });
  },

  _applySequenceTempo: function (target) {
    // this is very strange, still
    // and clock.tempo is potentially out of date
    // NEED TO MAKE THIS FLOW CONCRETE, and TEST IT
    target.tempo = this.engine.tempo();
  }
});

Clock.possibleSteps = memoize(function (bar, beat, bars, beats) {

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

Clock.ticksForTempoChange = memoize(function (tempo) {
  var rate = tempo / 100;
  var multiplier = rate > 2 ? rate - 1 : 1;
  var ticks = Math.ceil((rate * multiplier) * 4);
  return ticks < 2 ? 2 : ticks;
});

module.exports = Clock;
