var chai = require('chai');
var expect = chai.expect;
var Clock = require('../../lib/Clock');
var Sequence = require('../../lib/Sequence');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var clock;

beforeEach(function () {
  global.document = {};
  clock = new Clock();
  // clock.set('sequence', new Sequence(), { silent: true });
});

describe('Clock', function () {

  /*

    start(sequence) stop(sequence) pause(sequence)
    _onSequenceChange: set engine beats, tempo > schedule heartbeat
    _onChangeBeat: schedule heartbeat

  */

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

  xdescribe('step', function () {
    it('should execute the callback with the step note as argument', function () {
      var note = { foo: 'bar', start: function () {}, paddedPosition: function () {} };
      var callback = sinon.spy();
      clock.step = callback;
      clock._onSchedulerStep({
        id: 'current',
        event: 'start',
        args: note,
        time: 1
      });
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith(1, note);
    });
    describe('when the callback returns false', function () {
      it('should not execute note.start()', function () {
        var start = sinon.spy();
        var note = { foo: 'bar', start: start, paddedPosition: function () {} };
        clock.step = function () {
          return false;
        };
        clock._onSchedulerStep({
          id: 'current',
          event: 'start',
          args: note
        });
        expect(start).not.to.have.been.called;
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

  describe('_onChangePosition()', function () {
    describe('when position is not 0.0.00', function () {
      describe('when position is not same as scheduler.position', function () {
        it('should set the scheduler position', function () {
          var spy = sinon.spy();
          clock.scheduler = {
            setPosition: spy,
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
      it('should not set scheduler position', function () {
        var spy = sinon.spy();
        clock.scheduler = {
          setPosition: spy,
          _position: '1.1.01'
        };
        clock.set('position', '0.0.00', { silent: true });
        clock._onChangePosition();
        expect(spy).not.to.have.been.called;
      });
    });
    describe('when position is is same as scheduler.position', function () {
      it('should not set scheduler position', function () {
        var spy = sinon.spy();
        clock.scheduler = {
          setPosition: spy,
          _position: '2.1.01'
        };
        clock.set('position', '2.1.01', { silent: true });
        clock._onChangePosition();
        expect(spy).not.to.have.been.called;
      });
    });
  });
});
