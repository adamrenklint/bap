var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var Channel = require('../../lib/Channel');
var Note = require('../../lib/Note');
var channel;

beforeEach(function () {
  channel = new Channel();
});

describe('Channel', function () {

  describe('_start(time, note)', function () {
    it('should trigger "start" event', function () {
      var spy = sinon.spy();
      channel.on('start', spy);
      channel._start(1, {});
      expect(spy).to.have.been.calledOnce;
    });
    describe('when channel is muted', function () {
      it('should not trigger "start" event', function () {
        var spy = sinon.spy();
        channel.on('start', spy);
        channel.mute = true;
        channel._start(1, {});
        expect(spy).not.to.have.been.called;
      });
    });
  });

  describe('_stop(time, note)', function () {
    it('should trigger "stop" event', function () {
      var spy = sinon.spy();
      channel.on('stop', spy);
      channel._stop(1, {});
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe('add(note, ...)', function () {
    describe('when note is a raw object', function () {
      it('should create a note instance', function () {
        channel.add(['1.1.01', 'A1']);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0].type).to.equal('note');
      });
    });
    describe('when passing a note instance', function () {
      it('should just add the note', function () {
        var note = new Note({ position: '2.1.02', key: 'B5' });
        channel.add(note);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0]).to.equal(note);
      });
    });
  });
});
