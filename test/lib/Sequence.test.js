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
      it('should scope position expressions', function () {
        var pattern1 = new Pattern();
        var pattern2 = new Pattern();
        pattern1.channel(1).add(['1.1.01', 'A1']);
        pattern2.channel(1).add(['*.1.05', 'B1']);
        var seq = new Sequence(pattern1, [pattern1, pattern2]);
        var notes = seq.notes();
        expect(notes.length).to.equal(3);
        expect(notes[0].position).to.equal('1.1.01');
        expect(notes[0].key).to.equal('A1');
        expect(notes[1].position).to.equal('2.1.01');
        expect(notes[1].key).to.equal('A1');
        expect(notes[2].position).to.equal('*>1<3.1.05');
        expect(notes[2].key).to.equal('B1');
      });
      it('should add to scoped position expressions', function () {
        var pattern1 = new Pattern();
        var pattern2 = new Pattern();
        pattern1.channel(1).add(['1.1.01', 'A1']);
        pattern2.channel(1).add(['*.1.05', 'B1']);
        var seq1 = new Sequence(pattern1, [pattern1, pattern2]);
        // console.log(seq1.notes()[2].position);
        // return;
        global.doStep = true;
        var seq2 = new Sequence(seq1, seq1);
        var notes = seq2.notes();
        expect(notes.length).to.equal(6);
        expect(notes[0].position).to.equal('1.1.01');
        expect(notes[1].position).to.equal('2.1.01');
        expect(notes[2].position).to.equal('*>1<3.1.05');
        expect(notes[2].key).to.equal('B1');
        expect(notes[3].position).to.equal('3.1.01');
        expect(notes[4].position).to.equal('4.1.01');
        expect(notes[5].position).to.equal('*>3<5.1.05');
        expect(notes[5].key).to.equal('B1');
      });
    });
  });

  describe('tempoChanges()', function () {
    it('should return ')
  });

  describe('addOffsetToExpression(value, offset, length)', function () {
    describe('when value does not include existing offsets', function () {
      it('should set the offsets', function () {
        [
          [2, 2, '*>2<5'],
          [5, 3, '*>5<9']
        ].forEach(function (test) {
          expect(Sequence.addOffsetToExpression('*', test[0], test[1])).to.equal(test[2]);
        });
      });
    });
    describe('when value includes existing offsets', function () {
      it('should add the offset', function () {
        [
          ['*>3<6', 2, 2, '*>5<8'],
          ['*>2<6', 5, 3, '*>7<11']
        ].forEach(function (test) {
          expect(Sequence.addOffsetToExpression(test[0], test[1], test[2])).to.equal(test[3]);
        });
      });
    });
  });
});
