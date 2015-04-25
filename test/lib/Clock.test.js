var chai = require('chai');
var expect = chai.expect;
var Clock = require('../../lib/Clock');
var Sequence = require('../../lib/Sequence');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var clock;

beforeEach(function () {
  clock = new Clock();
  clock.set('sequence', new Sequence(), { silent: true });
});

describe('Clock', function () {

  describe('step(callback)', function () {
    describe('when callback is not a function', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          clock.step('foo');
        }).to.throw(/callback is not a function/);
      });
    });
    describe('when callback is a function', function () {
      it('should execute the callback with the step note as argument', function () {
        var note = { foo: 'bar', start: function () {}, paddedPosition: function () {} };
        var callback = sinon.spy();
        clock.step(callback);
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
        it('should not execute the next step handler', function () {
          var note = { foo: 'bar', start: function () {}, paddedPosition: function () {} };
          var first = sinon.spy(function () {
            return false;
          });
          var second = sinon.spy();
          clock.step(first);
          clock.step(second);
          clock._onSchedulerStep({
            id: 'current',
            event: 'start',
            args: note
          });
          expect(first).to.have.been.calledOnce;
          expect(second).not.to.have.been.called;
        });
        it('should not execute note.start()', function () {
          var start = sinon.spy();
          var note = { foo: 'bar', start: start, paddedPosition: function () {} };
          var first = function () {
            return false;
          };
          clock.step(first);
          clock._onSchedulerStep({
            id: 'current',
            event: 'start',
            args: note
          });
          expect(start).not.to.have.been.called;
        });
      });
    });
  });
});
