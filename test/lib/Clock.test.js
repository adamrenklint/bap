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

xdescribe('Clock', function () {

  describe('step', function () {
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
});
