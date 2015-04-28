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

  describe('add(note, ...)', function () {
    describe('when note is a raw object', function () {
      it('should create a note instance', function () {
        channel.add(['1.1.01', 'A1']);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0].type).to.equal('note');
      });
      it('should add a ghost to expandedNotes', function () {
        channel.add(['1.1.01', 'A1']);
        expect(channel.expandedNotes.filter(function (note) {
          return note.original = channel.rawNotes.models[0];
        }).length).to.equal(1);
      });
    });
    describe('when passing a note instance', function () {
      it('should just add the note', function () {
        var note = new Note({ position: '2.1.02', key: 'B5' });
        channel.add(note);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0]).to.equal(note);
      });
      it('should add a ghost to expandedNotes', function () {
        var note = new Note({ position: '2.1.02', key: 'B5' });
        channel.add(note);
        expect(channel.expandedNotes.filter(function (note) {
          return note.original = channel.rawNotes.models[0];
        }).length).to.equal(1);
      });
    });
  });

  describe('notes(bar, beat, tick)', function () {
    describe('when bar is not defined', function () {
      it('should return all notes', function () {
        channel.add(['1.1.01', 'A1']);
        channel.add(['2.3.01', 'A1']);
        var notes = channel.notes();
        expect(notes.length).to.equal(2);
        expect(notes[0].position).to.equal('1.1.01');
        expect(notes[1].position).to.equal('2.3.01');
      });
    });
    describe('when bar is defined', function () {
      describe('when beat is not defined', function () {
        it('should return all notes on that bar', function () {
          channel.add(['1.1.01', 'A1']);
          channel.add(['2.3.01', 'A1']);
          var notes = channel.notes(2);
          expect(notes.length).to.equal(1);
          expect(notes[0].position).to.equal('2.3.01');
        });
      });
      describe('when beat is defined', function () {
        describe('when tick is not defined', function () {
          it('should return all notes on that bar and beat', function () {
            channel.add(['1.1.01', 'A1']);
            channel.add(['2.3.01', 'A1']);
            channel.add(['2.2.01', 'A1']);
            channel.add(['2.3.45', 'A1']);
            channel.add(['2.4.01', 'A1']);
            var notes = channel.notes(2, 3);
            expect(notes.length).to.equal(2);
            expect(notes[0].position).to.equal('2.3.01');
            expect(notes[1].position).to.equal('2.3.45');
          });
        });
        describe('when tick is defined', function () {
          it('should return all notes on that bar, beat and tick', function () {
            channel.add(['1.1.01', 'A1']);
            channel.add(['2.3.01', 'A1']);
            channel.add(['2.2.01', 'A1']);
            channel.add(['2.3.45', 'A1']);
            channel.add(['2.4.01', 'A1']);
            var notes = channel.notes(2, 3, 1);
            expect(notes.length).to.equal(1);
            expect(notes[0].position).to.equal('2.3.01');
          });
        });
      });
    });
  });

  describe('_onAddExpandedNote(note)', function () {
    it('should add the note to the trie index', function () {
      var note = new Note({ position: '2.1.02', key: 'B5' });
      channel._onAddExpandedNote(note);
      expect(channel._cache[2][1][2].length).to.equal(1);
      expect(channel._cache[2][1][2]).to.contain(note);
      expect(channel._cache[2][1]['*'].length).to.equal(1);
      expect(channel._cache[2][1]['*']).to.contain(note);
      expect(channel._cache[2]['*'].length).to.equal(1);
      expect(channel._cache[2]['*']).to.contain(note);
    });
  });

  describe('_onRemoveExpandedNote(note)', function () {
    it('should remove the note from the trie index', function () {
      var note = new Note({ position: '2.1.02', key: 'B5' });
      channel._onAddExpandedNote(note);
      channel._onRemoveExpandedNote(note);
      expect(channel._cache[2][1][2].length).to.equal(0);
      expect(channel._cache[2][1][2]).not.to.contain(note);
      expect(channel._cache[2][1]['*'].length).to.equal(0);
      expect(channel._cache[2][1]['*']).not.to.contain(note);
      expect(channel._cache[2]['*'].length).to.equal(0);
      expect(channel._cache[2]['*']).not.to.contain(note);
    });
  });

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
});
