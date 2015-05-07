var chai = require('chai');
var expect = chai.expect;
var Clock = require('../../lib/Clock');
var Sequence = require('../../lib/Sequence');
var Note = require('../../lib/Note');
var Pattern = require('../../lib/Pattern');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var clock;

describe('Clock', function () {

  beforeEach(function () {
    global.document = {};
    clock = new Clock();
  });

  afterEach(function () {
    clock.destroy();
  });

  describe('events', function () {
    var spy;
    beforeEach(function () {
      spy = sinon.spy();
      var MockedClock = Clock.extend({
        _scheduleSteps: spy
      });
      clock = new MockedClock();
    });
    describe('when change:bar is called', function () {
      it('should call _scheduleSteps()', function () {
        clock.trigger('change:bar');
        expect(spy).to.have.been.calledOnce;
      });
    });
    describe('when change:beat is called', function () {
      it('should call _scheduleSteps()', function () {
        clock.trigger('change:beat');
        expect(spy).to.have.been.calledOnce;
      });
    });
    describe('when change:tick is called', function () {
      it('should not call _scheduleSteps()', function () {
        clock.trigger('change:tick');
        expect(spy).not.to.have.been.called;
      });
    });
  });

  describe('step', function () {
    describe('when a clock.step function is defined', function () {
      describe('when it returns false', function () {
        it('should not schedule the note', function () {
          clock.step = function () { return false; };
          var pattern = clock.sequence = new Pattern();
          var note = new Note({ position: '1.1.01' });
          pattern.channel(1).add(note);
          var spy = note.start = sinon.spy();
          clock._queueNotesForStep('1.1.01', 10);
          expect(spy).not.to.have.been.called;
        });
      });
      describe('when it does not return false', function () {
        it('should schedule the note', function () {
          clock.step = function () { return; };
          var pattern = clock.sequence = new Pattern();
          var note = new Note({ position: '1.1.01' });
          pattern.channel(1).add(note);
          var spy = note.start = sinon.spy();
          clock._queueNotesForStep('1.1.01', 10);
          expect(spy).to.have.been.calledOnce;
        });
      });
    });
    describe('when a clock.step function is not defined', function () {
      it('should not throw an error', function () {
        expect(function () {
          var pattern = clock.sequence = new Pattern();
          var note = new Note({ position: '1.1.01' });
          pattern.channel(1).add(note);
          var spy = note.start = sinon.spy();
          clock._queueNotesForStep('1.1.01', 10);
          expect(spy).to.have.been.calledOnce;
        }).not.to.throw(Error);
      });
      it('should schedule the note', function () {
        var pattern = clock.sequence = new Pattern();
        var note = new Note({ position: '1.1.01' });
        pattern.channel(1).add(note);
        var spy = note.start = sinon.spy();
        clock._queueNotesForStep('1.1.01', 10);
        expect(spy).to.have.been.calledOnce;
      });
    });
  });

  describe('canStartPlaying()', function () {
    describe('when document.readyState is "loading"', function () {
      it('should return false', function () {
        global.document.readyState = 'loading';
        expect(clock.canStartPlaying()).to.be.false;
      });
    });
    describe('when vent.loading is true', function () {
      it('should return false', function () {
        clock.vent.loading = true;
        expect(clock.canStartPlaying()).to.be.false;
      });
    });
    it('should return true', function () {
      expect(clock.canStartPlaying()).to.be.true;
    });
  });

  describe('start(sequence)', function () {
    describe('when canStartPlaying() returns false', function () {
      it('should call start() again in ~10 ms', function (done) {
        clock.canStartPlaying = function () { return false; };
        clock.start();
        sinon.spy(clock, 'start');
        setTimeout(function () {
          expect(clock.start).to.have.been.called;
          done();
        }, 15);
      });
    });
    describe('when canStartPlaying() returns true', function () {
      beforeEach(function () {
        clock.canStartPlaying = function () { return true; };
        clock.engine = {
          start: sinon.spy(),
          set: sinon.spy(),
          setBeatsPerBar: sinon.spy(),
          setLoopLength: sinon.spy(),
          setPosition: sinon.spy(),
          setTempo: sinon.spy()
        };
      });
      describe('when sequence is defined', function () {
        it('should set it as clock.sequence', function () {
          var sequence = new Sequence();
          clock.start(sequence);
          expect(clock.sequence).to.equal(sequence);
        });
      });
      describe('when sequence is not defined', function () {
        it('should not throw an error', function () {
          expect(function () {
            clock.start();
          }).not.to.throw(Error);
        });
      });
      it('it should not call engine.start immediately, but within 1ms', function (done) {
        clock.start();
        expect(clock.engine.start).not.to.have.been.called;
        setTimeout(function () {
          expect(clock.engine.start).to.have.been.called;
          done();
        }, 1);
      });
      describe('when restarting the sequence', function () {
        it('should set current position as _lastQueuedPosition', function () {
          clock.set('position', '1.3.54', { silent: true });
          clock.sequence = new Sequence();
          clock.start();
          expect(clock._lastQueuedPosition).to.equal('1.3.54');
        });
        it('should set current position as engine position', function () {
          clock.set('position', '1.3.54', { silent: true });
          clock.sequence = new Sequence();
          clock.start();
          expect(clock.engine.setPosition).to.have.been.called;
          expect(clock.engine.setPosition).to.have.been.calledWith('1.3.54');
        });
      });
      describe('when _stopByFold is true', function () {
        it('should set _stopByFold to false', function () {
          clock._stopByFold = true;
          clock.start();
          expect(clock._stopByFold).to.be.false
        });
        it('should set position to 1.1.01', function () {
          clock._stopByFold = true;
          clock.set('position', '2.4.96', { silent: true });
          clock.start();
          expect(clock.position).to.equal('1.1.01');
        });
      });
    });
  });

  describe('pause(sequence)', function () {
    describe('when playing is false', function () {
      beforeEach(function () {
        clock.set('playing', false, { silent: true });
      });
      it('should not change position', function () {
        clock.set('position', '1.2.95', { silent: true });
        clock.pause();
        expect(clock.position).to.equal('1.2.95');
      });
      it('should not change _lastQueuedPosition', function () {
        clock.set('_lastQueuedPosition', '1.2.95', { silent: true });
        clock.pause();
        expect(clock._lastQueuedPosition).to.equal('1.2.95');
      });
    });
    describe('when playing is true', function () {
      beforeEach(function () {
        clock.set('playing', true, { silent: true });
      });
      it('should reset _lastQueuedPosition', function () {
        clock._lastQueuedPosition = '1.2.03';
        clock.pause();
        expect(clock._lastQueuedPosition).to.equal('0.0.00');
      });
      describe('when no sequence is defined', function () {
        it('should change playing state', function () {
          clock.sequence = new Pattern();
          clock.pause();
          expect(clock.playing).to.be.false;
        });
      });
      describe('when sequence is not clock.sequence', function () {
        it('should not change playing state', function () {
          clock.sequence = new Pattern();
          clock.pause(new Pattern());
          expect(clock.playing).to.be.true;
        });
      });
      describe('when sequence is clock.sequence', function () {
        it('should change playing state', function () {
          clock.sequence = new Pattern();
          clock.pause(clock.sequence);
          expect(clock.playing).to.be.false;
        });
      });
    });
  });

  describe('stop(sequence)', function () {
    describe('when playing is false', function () {
      beforeEach(function () {
        clock.set('playing', false, { silent: true });
      });
      it('should not change position', function () {
        clock.set('position', '1.2.95', { silent: true });
        clock.stop();
        expect(clock.position).to.equal('1.2.95');
      });
      it('should not change _lastQueuedPosition', function () {
        clock.set('_lastQueuedPosition', '1.2.95', { silent: true });
        clock.stop();
        expect(clock._lastQueuedPosition).to.equal('1.2.95');
      });
    });
    describe('when playing is true', function () {
      beforeEach(function () {
        clock.set('playing', true, { silent: true });
      });
      it('should reset _lastQueuedPosition', function () {
        clock._lastQueuedPosition = '1.2.03';
        clock.stop();
        expect(clock._lastQueuedPosition).to.equal('0.0.00');
      });
      describe('when no sequence is defined', function () {
        it('should change playing state', function () {
          clock.sequence = new Pattern();
          clock.stop();
          expect(clock.playing).to.be.false;
        });
      });
      describe('when sequence is not clock.sequence', function () {
        it('should not change playing state', function () {
          clock.sequence = new Pattern();
          clock.stop(new Pattern());
          expect(clock.playing).to.be.true;
        });
      });
      describe('when sequence is clock.sequence', function () {
        it('should change playing state', function () {
          clock.sequence = new Pattern();
          clock.stop(clock.sequence);
          expect(clock.playing).to.be.false;
        });
      });
    });
  });

  describe('playing', function () {
    describe('when setting to true', function () {
      it('should call start()', function () {
        clock.set('playing', false, { silent: true });
        clock.pause = sinon.spy();
        clock.start = sinon.spy();
        clock.playing = true;
        expect(clock.start).to.have.been.calledOnce;
        expect(clock.pause).not.to.have.been.called;
      });
    });
    describe('when setting to false', function () {
      it('should call pause()', function () {
        clock.set('playing', true, { silent: true });
        clock.pause = sinon.spy();
        clock.start = sinon.spy();
        clock.playing = false;
        expect(clock.pause).to.have.been.calledOnce;
        expect(clock.start).not.to.have.been.called;
      });
    });
    describe('when clock.sequence is defined', function () {
      it('should forward clock.playing to sequence', function () {
        var sequence = new Sequence;
        clock.set('sequence', sequence, { silent: true });
        clock.pause = sinon.spy();
        clock.start = sinon.spy();
        expect(sequence.playing).to.be.false;
        clock.playing = true;
        expect(sequence.playing).to.be.true;
        clock.playing = false;
        expect(sequence.playing).to.be.false;
      });
    });
  });

  describe('_onChangeSequence()', function () {
    it('should bind change:sequence.beatsPerBar to _onChangeSequence', function () {
      sinon.spy(clock, '_onChangeSequence');
      var sequence = new Sequence();
      clock.set('sequence', sequence, { silent: true });
      clock._onChangeSequence();
      clock._onChangeSequence.reset();
      sequence.trigger('change:beatsPerBar');
      expect(clock._onChangeSequence).to.have.been.calledOnce;
    });
    it('should bind change:sequence.bars to _onChangeSequence', function () {
      sinon.spy(clock, '_onChangeSequence');
      var sequence = new Sequence();
      clock.set('sequence', sequence, { silent: true });
      clock._onChangeSequence();
      clock._onChangeSequence.reset();
      sequence.trigger('change:bars');
      expect(clock._onChangeSequence).to.have.been.calledOnce;
    });
    it('should unbind events on previous sequence', function () {
      sinon.spy(clock, '_onChangeSequence');
      var sequence1 = new Sequence();
      clock.set('sequence', sequence1, { silent: true });
      clock._onChangeSequence();
      var sequence2 = new Sequence();
      clock.set('sequence', sequence2, { silent: true });
      clock._onChangeSequence();
      clock._onChangeSequence.reset();
      sequence1.trigger('change:beatsPerBar');
      expect(clock._onChangeSequence).not.to.have.been.called;
    });
  });

  describe('_onEngineTick(tick)', function () {
    describe('when clock.playing is false', function () {
      it('should not change clock.position', function () {
        clock.set('position', '1.1.01', { silent:true });
        clock.set('playing', false, { silent: true });
        clock._onEngineTick({
          position: '1.1.05'
        });
        expect(clock.position).to.equal('1.1.01');
      });
    });
    describe('when clock.playing is true', function () {
      beforeEach(function () {
        clock.set('playing', true, { silent: true });
      });
      describe('when _stopByFold is false (default)', function () {
        describe('when tick.position is not 0.0.00', function () {
          it('should set clock.position', function () {
            clock._onEngineTick({
              position: '1.2.03'
            });
            expect(clock.position).to.equal('1.2.03');
          });
        });
        describe('when tick.position is 0.0.00', function () {
          it('should not change clock.position', function () {
            clock.set('position', '1.1.01', { silent:true });
            clock._onEngineTick({
              position: '0.0.00'
            });
            expect(clock.position).to.equal('1.1.01');
          });
        });
      });
      describe('when _stopByFold is true', function () {
        it('should call pause()', function () {
          clock._stopByFold = true;
          clock.set('position', '2.4.93', { silent: true });
          clock.sequence = new Pattern({ bars: 2 });
          var spy = clock.pause = sinon.spy();
          clock._onEngineTick({
            position: '1.1.01'
          });
          expect(spy).to.have.been.calledOnce;
        });
        it('should set the position to the last tick of the sequence', function () {
          clock._stopByFold = true;
          clock.set('position', '2.4.93', { silent: true });
          clock.sequence = new Pattern({ bars: 2 });
          clock._onEngineTick({
            position: '1.1.01'
          });
          expect(clock.position).to.equal('2.4.96');
        });
        it('should reset _lastQueuedPosition', function () {
          clock._stopByFold = true;
          clock.set('position', '2.4.95', { silent: true });
          clock._lastQueuedPosition = '2.4.95';
          clock.sequence = new Pattern({ bars: 2 });
          clock._onEngineTick({
            position: '1.1.01'
          });
          expect(clock._lastQueuedPosition).to.equal('0.0.00');
        });
      });
    });
  });

  describe('__updateTempo(position)', function () {
    describe('when no sequence is set', function () {
      it('should set the tempo to 120', function () {
        clock.set('tempo', 150, { silent: true });
        clock._updateTempo();
        expect(clock.tempo).to.equal(120);
      });
    });
    describe('when a sequence is set', function () {
      describe('when no position is passed', function () {
        it('should set the tempo of the sequence', function () {
          clock.sequence = new Sequence(new Pattern({ tempo: 135 }));
          clock._updateTempo();
          expect(clock.tempo).to.equal(135);
        });
      });
      describe('when sequence is a pattern', function () {
        it('should set the tempo of the pattern', function () {
          clock.sequence = new Pattern({ tempo: 135 });
          clock._updateTempo();
          expect(clock.tempo).to.equal(135);
        });
      });
      beforeEach(function () {
        clock.sequence = new Sequence(
          new Pattern({ bars: 2, tempo: 100 }),
          new Pattern({ bars: 2, tempo: 50 }),
          new Pattern({ bars: 2, tempo: 140 })
        );
      });
      describe('when sequence is a multi-layered sequence', function () {
        describe('when position is at middle of pattern', function () {
          it('should set tempo of current pattern', function () {
            clock._updateTempo('1.1.01');
            expect(clock.tempo).to.equal(100);
            clock._updateTempo('2.4.90');
            expect(clock.tempo).to.equal(100);
          });
        });
        describe('when position is at end of pattern', function () {
          it('should set tempo of next pattern', function () {
            clock._updateTempo('2.4.94');
            expect(clock.tempo).to.equal(50);
          });
        });
        describe('when position is at end of loop', function () {
          describe('when sequence is looped', function () {
            it('should set tempo of the first pattern', function () {
              clock.sequence.loop = true;
              clock._updateTempo('6.4.95');
              expect(clock.tempo).to.equal(100);
            });
          });
          describe('when sequence is not looped', function () {
            it('should set tempo of the last pattern', function () {
              clock.sequence.loop = false;
              clock._updateTempo('6.4.95');
              expect(clock.tempo).to.equal(140);
            });
          });
        });
      });
    });
  });

  describe('_scheduleSteps()', function () {
    it('should schedule lookahead steps', function () {
      expect(clock.engine.get('lookahead').length).to.equal(0);
      clock.position = '1.2.45';
      clock._scheduleSteps();
      expect(clock.engine.get('lookahead').length).to.equal(192);
    });
  });

  describe('_lookaheadSteps()', function () {
    it('should return an array', function () {
      expect(clock._lookaheadSteps()).to.be.a('array');
    });
    describe('when clock.position is 0.0.00', function () {
      it('should return 192 lookahead steps', function () {
        clock.position = '0.0.00';
        var steps = clock._lookaheadSteps();
        expect(steps.length).to.equal(192);
        expect(steps[0]).to.equal('1.1.01');
        expect(steps[95]).to.equal('1.1.96');
        expect(steps[96]).to.equal('1.2.01');
        expect(steps[191]).to.equal('1.2.96');
      });
    });
    describe('when clock has no sequence set', function () {
      it('should return 0 lookahead steps', function () {
        expect(clock._lookaheadSteps().length).to.equal(192);
      });
    });
    describe('when clock has a sequence set', function () {
      it('should return 192 lookahead steps', function () {
        clock.position = '1.2.45';
        clock.sequence = new Pattern({ bars: 4 });
        expect(clock._lookaheadSteps().length).to.equal(192);
      });
      it('should return steps for the current and next beat', function () {
        clock.sequence = new Pattern({ bars: 2 });
        clock.position = '1.1.01';
        var steps = clock._lookaheadSteps();
        expect(steps[0]).to.equal('1.1.01');
        expect(steps[95]).to.equal('1.1.96');
        expect(steps[96]).to.equal('1.2.01');
        expect(steps[191]).to.equal('1.2.96');
      });
      it('should fold around the of a bar correctly', function () {
        clock.sequence = new Pattern({ bars: 2 });
        clock.position = '1.4.01';
        var steps = clock._lookaheadSteps();
        expect(steps[0]).to.equal('1.4.01');
        expect(steps[95]).to.equal('1.4.96');
        expect(steps[96]).to.equal('2.1.01');
        expect(steps[191]).to.equal('2.1.96');
      });
      it('should fold around the of a sequence correctly', function () {
        clock.sequence = new Pattern({ bars: 2 });
        clock.position = '2.4.01';
        var steps = clock._lookaheadSteps();
        expect(steps[0]).to.equal('2.4.01');
        expect(steps[95]).to.equal('2.4.96');
        expect(steps[96]).to.equal('1.1.01');
        expect(steps[191]).to.equal('1.1.96');
      });
    });
  });

  describe('_onEngineStep(step)', function () {
    describe('when clock.playing is false', function () {
      it('should not call clock._queueNotesForStep', function () {
        var spy = clock._queueNotesForStep = sinon.spy();
        clock._foldingOverLoop = function () { return false; };
        clock._onEngineStep({
          id: 'lookahead',
          time: 5,
          position: '1.2.03'
        });
        expect(spy).not.to.have.been.called;
      });
    });
    describe('when clock.playing is true', function () {
      beforeEach(function () {
        clock.set('playing', true, { silent: true });
      });
      describe('when step is a lookahead step', function () {
        describe('when _foldingOverLoop() returns false', function () {
          it('should call clock._queueNotesForStep', function () {
            var spy = clock._queueNotesForStep = sinon.spy();
            clock._foldingOverLoop = function () { return false; };
            clock._onEngineStep({
              id: 'lookahead',
              time: 5,
              position: '1.2.03'
            });
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith('1.2.03', 5);
          });
          it('should set _lastQueuedPosition', function () {
            var spy = clock._queueNotesForStep = sinon.spy();
            clock._foldingOverLoop = function () { return false; };
            clock._onEngineStep({
              id: 'lookahead',
              time: 5,
              position: '1.2.03'
            });
            expect(clock._lastQueuedPosition).to.equal('1.2.03');
          });
        });
        describe('when _foldingOverLoop() returns true', function () {
          it('should not call clock._queueNotesForStep', function () {
            var spy = clock._queueNotesForStep = sinon.spy();
            clock._foldingOverLoop = function () { return true; };
            clock._onEngineStep({
              id: 'lookahead',
              time: 5,
              position: '1.2.03'
            });
            expect(spy).not.to.have.been.called;
          });
        });
      });
      describe('when step is not a lookahead step', function () {
        it('should not call clock._queueNotesForStep', function () {
          var spy = clock._queueNotesForStep = sinon.spy();
          clock._onEngineStep({
            id: 'foo',
            time: 5,
            position: '1.2.03'
          });
          expect(spy).not.to.have.been.called;
        });
      });
    });
  });

  describe('_foldingOverLoop(position)', function () {
    describe('when _lastQueuedPosition is not set', function () {
      describe('when sequence.loop is true', function () {
        it('should return false', function () {
          clock.sequence = new Sequence({ loop: true });
          expect(clock._foldingOverLoop('1.1.01')).to.be.false;
          expect(clock._stopByFold).to.be.false;
        });
      });
      describe('when sequence.loop is false', function () {
        it('should return false', function () {
          clock.sequence = new Sequence({ loop: false });
          expect(clock._foldingOverLoop('1.1.01')).to.be.false;
          expect(clock._stopByFold).to.be.false;
        });
      });
    });
    describe('when _lastQueuedPosition is before position', function () {
      describe('when sequence.loop is true', function () {
        it('should return false', function () {
          clock._lastQueuedPosition = '1.1.01'
          clock.sequence = new Sequence({ loop: true });
          expect(clock._foldingOverLoop('1.2.02')).to.be.false;
          expect(clock._stopByFold).to.be.false;
        });
      });
      describe('when sequence.loop is false', function () {
        it('should return false', function () {
          clock._lastQueuedPosition = '1.1.01'
          clock.sequence = new Sequence({ loop: false });
          expect(clock._foldingOverLoop('1.2.02')).to.be.false;
          expect(clock._stopByFold).to.be.false;
        });
      });
    });
    describe('when _lastQueuedPosition is after position', function () {
      describe('when sequence.loop is true', function () {
        it('should return false', function () {
          clock._lastQueuedPosition = '1.4.01'
          clock.sequence = new Sequence({ loop: true });
          expect(clock._foldingOverLoop('1.1.02')).to.be.false;
          expect(clock._stopByFold).to.be.false;
        });
      });
      describe('when sequence.loop is false', function () {
        it('should return true', function () {
          clock._lastQueuedPosition = '1.4.01'
          clock.sequence = new Sequence({ loop: false });
          expect(clock._foldingOverLoop('1.1.02')).to.be.true;
          expect(clock._stopByFold).to.be.true;
        });
      });
    });
  });

  describe('_queueNotesForStep(position, time)', function () {
    describe('when there is no current sequence', function () {
      it('should not throw an error', function () {
        expect(function () {
          clock._queueNotesForStep('1.2.03', 5);
        }).not.to.throw(Error);
      });
    });
    describe('when the current sequence has notes on the current position', function () {
      it('should call start() on notes and pass time', function () {
        var pattern = clock.sequence = new Pattern();
        var note = new Note({ position: '1.1.05' });
        pattern.channel(1).add(note);
        var spy = note.start = sinon.spy();
        clock._queueNotesForStep('1.1.05', 5);
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWith(5);
      });
    });
    describe('when the current sequence has multiple notes from different patterns', function () {
      it('should call start() on all of them', function () {
        var pattern1 = new Pattern();
        var note1 = new Note({ position: '1.1.05' });
        pattern1.channel(1).add(note1);
        var pattern2 = new Pattern();
        var note2 = new Note({ position: '1.1.05' });
        pattern2.channel(1).add(note2);
        var sequence = new Sequence([pattern1, pattern2], [pattern1, pattern2]);
        var spy1 = note1.start = sinon.spy();
        var spy2 = note2.start = sinon.spy();
        clock.sequence = sequence;
        clock._queueNotesForStep('2.1.05', 5);
        expect(spy1).to.have.been.calledOnce;
        expect(spy1).to.have.been.calledWith(5);
        expect(spy2).to.have.been.calledOnce;
        expect(spy2).to.have.been.calledWith(5);
      });
    });
  });

  describe('_onChangePosition()', function () {
    describe('when position is not 0.0.00', function () {
      describe('when position is not same as engine.position', function () {
        it('should set engine.position', function () {
          var spy = sinon.spy();
          clock.engine = {
            setPosition: spy,
            setTempo: function () {},
            _position: '1.1.01'
          };
          clock.set('position', '2.1.01', { silent: true });
          clock._onChangePosition();
          expect(spy).to.have.been.calledOnce;
          expect(spy).to.have.been.calledWith('2.1.01');
        });
      });
    });
    describe('when position is 0.0.00', function () {
      it('should not set engine.position', function () {
        var spy = sinon.spy();
        clock.engine = {
          setPosition: spy,
          _position: '1.1.01'
        };
        clock.set('position', '0.0.00', { silent: true });
        clock._onChangePosition();
        expect(spy).not.to.have.been.called;
      });
    });
    describe('when position is is same as engine.position', function () {
      it('should not engine.position', function () {
        var spy = sinon.spy();
        clock.engine = {
          setPosition: spy,
          _position: '2.1.01'
        };
        clock.set('position', '2.1.01', { silent: true });
        clock._onChangePosition();
        expect(spy).not.to.have.been.called;
      });
    });
  });

  describe('Clock.ticksForTempoChange(tempo)', function () {
    [
      [0,   2],
      [50,  2],
      [100, 4],
      [150, 6],
      [200, 8],
      [250, 15],
      [300, 24]
    ].forEach(function (test) {
      describe('when tempo is ' + test[0], function () {
        it('should return ' + test[1] + ' (ticks)', function () {
          expect(Clock.ticksForTempoChange(test[0])).to.equal(test[1]);
        });
      });
    });
  });
});
