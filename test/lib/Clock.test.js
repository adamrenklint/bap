var chai = require('chai');
var expect = chai.expect;
var Clock = require('../../lib/Clock');
var Sequence = require('../../lib/Sequence');
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
          expect(clock.start).to.have.been.calledOnce;
          done();
        }, 15);
      });
    });
  });

  // xdescribe('step', function () {
  //   it('should execute the callback with the step note as argument', function () {
  //     var note = { foo: 'bar', start: function () {}, paddedPosition: function () {} };
  //     var callback = sinon.spy();
  //     clock.step = callback;
  //     clock._onSchedulerStep({
  //       id: 'current',
  //       event: 'start',
  //       args: note,
  //       time: 1
  //     });
  //     expect(callback).to.have.been.calledOnce;
  //     expect(callback).to.have.been.calledWith(1, note);
  //   });
  //   describe('when the callback returns false', function () {
  //     it('should not execute note.start()', function () {
  //       var start = sinon.spy();
  //       var note = { foo: 'bar', start: start, paddedPosition: function () {} };
  //       clock.step = function () {
  //         return false;
  //       };
  //       clock._onSchedulerStep({
  //         id: 'current',
  //         event: 'start',
  //         args: note
  //       });
  //       expect(start).not.to.have.been.called;
  //     });
  //   });
  // });

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

  describe('_onEngineTick(tick)', function () {
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

  describe('_lookaheadSteps()', function () {
    describe('when position is 1.1.01', function () {
      it('should return all ticks for 1.1 and 1.2', function () {
        clock.position = '1.1.01';
        var steps = clock._lookaheadSteps();
        expect(steps.length).to.equal(96 * 2);
        expect(steps[0]).to.equal('1.1.01');
        expect(steps[95]).to.equal('1.1.96');
        expect(steps[96]).to.equal('1.2.01');
        expect(steps[191]).to.equal('1.2.96');
      });
    });
    describe('when position is 1.3.01', function () {
      it('should return all ticks for 1.3 and 1.4', function () {
        clock.position = '1.3.01';
        var steps = clock._lookaheadSteps();
        expect(steps.length).to.equal(96 * 2);
        expect(steps[0]).to.equal('1.3.01');
        expect(steps[95]).to.equal('1.3.96');
        expect(steps[96]).to.equal('1.4.01');
        expect(steps[191]).to.equal('1.4.96');
      });
    });
    describe('when position is 1.4.01', function () {
      it('should return all ticks for 1.4 and 1.1', function () {
        clock.position = '1.4.01';
        var steps = clock._lookaheadSteps();
        expect(steps.length).to.equal(96 * 2);
        expect(steps[0]).to.equal('1.4.01');
        expect(steps[95]).to.equal('1.4.96');
        expect(steps[96]).to.equal('1.1.01');
        expect(steps[191]).to.equal('1.1.96');
      });
    });
    describe('when position is 2.4.01', function () {
      it('should return all ticks for 1.4 and 2.1', function () {
        clock.position = '1.4.01';
        clock.sequence = new Sequence(new Pattern(), new Pattern());
        var steps = clock._lookaheadSteps();
        expect(steps.length).to.equal(96 * 2);
        expect(steps[0]).to.equal('1.4.01');
        expect(steps[95]).to.equal('1.4.96');
        expect(steps[96]).to.equal('2.1.01');
        expect(steps[191]).to.equal('2.1.96');
      });
    });
  });

  describe('_scheduleSteps()', function () {
    it('should schedule lookahead steps', function () {
      expect(clock.engine.get('steps').length).to.equal(0);
      clock._scheduleSteps();
      expect(clock.engine.get('steps').length).to.equal(96 * 4 * 2);
    });
  });

  describe('_lookaheadSteps()', function () {
    it('should return an array', function () {
      expect(clock._lookaheadSteps()).to.be.a('array');
    });
    describe('when clock has a sequence set', function () {
      it('should return 192 lookahead steps', function () {
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
    describe('when clock has no sequence set', function () {
      it('should return 192 lookahead steps', function () {
        expect(clock._lookaheadSteps().length).to.equal(192);
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
});
