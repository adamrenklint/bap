var chai = require('chai');
var expect = chai.expect;
var Sequence = require('../../lib/Sequence');
var Pattern = require('../../lib/Pattern');

var sequence;

beforeEach(function () {
  sequence = new Sequence();
});

describe('Sequence', function () {

  describe('constructor(sequences..., [params])', function () {
    describe('when an array of sequences is passed as arguments', function () {
      it('should set it as sequence.sequences', function () {
        var pattern = new Pattern();
        var inner = new Sequence(pattern);
        var seq = new Sequence(inner, [inner, pattern]);
        expect(seq.sequences.length).to.equal(2);
        expect(seq.sequences[0].length).to.equal(1);
        expect(seq.sequences[1].length).to.equal(2);
      });
      describe('when the last argument is an object', function () {
        it('should set it as params', function () {
          var pattern = new Pattern();
          var inner = new Sequence(pattern);
          var seq = new Sequence(inner, [inner, pattern], { loop: true });
          expect(seq.loop).to.be.true;
        });
      })
    });
  });

  describe('notes(returnOriginals)', function () {
    describe('when returnOriginals is true', function () {
      it('should return the original notes', function () {
        var pattern = new Pattern();
        pattern.channel(1).add(['1.1.01', 'A1']);
        var seq = new Sequence(pattern);
        var notes = seq.notes(true);
        expect(notes.length).to.equal(1);
        expect(notes[0]).to.equal(pattern.channel(1).notes.models[0]);
      });
      it('should only return one instance of each note', function () {
        var pattern = new Pattern();
        pattern.channel(1).add(['1.1.01', 'A1']);
        var seq = new Sequence(pattern, pattern, pattern);
        var notes = seq.notes(true);
        expect(notes.length).to.equal(1);
      });
    });
    describe('when returnOriginals is not true', function () {
      it('should return ghost notes', function () {
        var pattern = new Pattern();
        pattern.channel(1).add(['1.1.01', 'A1']);
        var seq = new Sequence(pattern);
        var notes = seq.notes();
        expect(notes.length).to.equal(1);
        expect(notes[0].cid).not.to.equal(pattern.channel(1).notes.models[0].cid);
        expect(notes[0].original.cid).to.equal(pattern.channel(1).notes.models[0].cid);
      });
    });
  });

  // describe('tempoChanges()');
});
