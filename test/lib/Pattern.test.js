var chai = require('chai');
var expect = chai.expect;
var Pattern = require('../../lib/Pattern');
var Channel = require('../../lib/Channel');
var Sequence = require('../../lib/Sequence');
var Kit = require('../../lib/Kit');

var pattern;

beforeEach(function () {
  pattern = new Pattern();
});

describe('Pattern', function () {

  xdescribe('notes(bar, beat, tick)', function () {
    describe('when bar is not defined', function () {
      it('should return all notes', function () {
        pattern.channel(1).add(['1.1.01', 'A1']);
        pattern.channel(1).add(['2.3.01', 'A1']);
        var notes = pattern.notes();
        expect(notes.length).to.equal(2);
        expect(notes[0].position).to.equal('1.1.01');
        expect(notes[1].position).to.equal('2.3.01');
      });
    });
    describe('when bar is defined', function () {
      describe('when beat is not defined', function () {
        it('should return all notes on that bar', function () {
          pattern.channel(1).add(['1.1.01', 'A1']);
          pattern.channel(1).add(['2.3.01', 'A1']);
          pattern.channel(2).add(['1.1.01', 'A1']);
          pattern.channel(2).add(['2.3.01', 'A1']);
          var notes = pattern.notes(2);
          expect(notes.length).to.equal(2);
          expect(notes[0].position).to.equal('2.3.01');
          expect(notes[1].position).to.equal('2.3.01');
        });
      });
      describe('when beat is defined', function () {
        describe('when tick is not defined', function () {
          it('should return all notes on that bar and beat', function () {
            pattern.channel(1).add(['1.1.01', 'A1']);
            pattern.channel(1).add(['2.3.01', 'A1']);
            pattern.channel(1).add(['2.2.01', 'A1']);
            pattern.channel(2).add(['2.3.45', 'A1']);
            pattern.channel(1).add(['2.4.01', 'A1']);
            var notes = pattern.notes(2, 3);
            expect(notes.length).to.equal(2);
            expect(notes[0].position).to.equal('2.3.01');
            expect(notes[1].position).to.equal('2.3.45');
          });
        });
        describe('when tick is defined', function () {
          it('should return all notes on that bar, beat and tick', function () {
            pattern.channel(1).add(['1.1.01', 'A1']);
            pattern.channel(1).add(['2.3.01', 'A1']);
            pattern.channel(1).add(['2.2.01', 'A1']);
            pattern.channel(2).add(['2.3.45', 'A1']);
            pattern.channel(1).add(['2.4.01', 'A1']);
            var notes = pattern.notes(2, 3, 1);
            expect(notes.length).to.equal(1);
            expect(notes[0].position).to.equal('2.3.01');
          });
        });
      });
    });
  });

  describe('kit(id, kit)', function () {
    describe('when id is a letter from A to Z', function () {
      describe('when kit is an instance of Kit', function () {
        it('should connect the kit to id', function () {
          var kit = new Kit();
          pattern.kit('A', kit);
          expect(pattern.kits.A).to.equal(kit);
        });
        it('should be chainable', function () {
          var kit = new Kit();
          var ret = pattern.kit('A', kit);
          expect(ret).to.equal(pattern);
        });
      });
      describe('when kit is not an instance of Kit', function () {
        describe('when there is a kit connected to id', function () {
          it('should return the connected kit', function () {
            var kit = new Kit();
            pattern.kit('A', kit);
            var ret = pattern.kit('A');
            expect(ret).to.equal(kit);
          });
        });
        describe('when there is no kit connected to id', function () {
          it('should return falsy', function () {
            var ret = pattern.kit('A');
            expect(ret).to.be.falsy;
          });
        });
      });
    });
    describe('when id is not a letter from A to Z', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          var kit = new Kit();
          pattern.kit(99, kit);
        }).to.throw(/kit id must be single letter from A to Z/i);
      });
    });
  });

  describe('then(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = pattern.then(seq1);
      expect(seq2).to.be.instanceOf(Sequence);
    });
    it('should add passed sequences after', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = pattern.then(seq1, seq2, pattern, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(5);
      expect(seq4.sequences[0][0]).to.equal(pattern);
      expect(seq4.sequences[1][0]).to.equal(seq1);
      expect(seq4.sequences[2][0]).to.equal(seq2);
      expect(seq4.sequences[3][0]).to.equal(pattern)
      expect(seq4.sequences[4][0]).to.equal(seq2);
      expect(seq4.sequences[4][1]).to.equal(seq3);
    });
  });

  describe('after(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = pattern.after(seq1);
      expect(seq2).to.be.instanceOf(Sequence);
    });
    it('should add passed sequences before', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = pattern.after(seq1, seq2, pattern, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(5);
      expect(seq4.sequences[0][0]).to.equal(seq1);
      expect(seq4.sequences[1][0]).to.equal(seq2);
      expect(seq4.sequences[2][0]).to.equal(pattern)
      expect(seq4.sequences[3][0]).to.equal(seq2);
      expect(seq4.sequences[3][1]).to.equal(seq3);
      expect(seq4.sequences[4][0]).to.equal(pattern);
    });
  });

  describe('and(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = pattern.and(seq1);
      expect(seq2).to.be.instanceOf(Sequence);
    });
    it('should flatten sequences and remove duplicates', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = pattern.and(seq1, seq2, pattern, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(1);
      expect(seq4.sequences[0].length).to.equal(4);
      expect(seq4.sequences[0][0]).to.equal(pattern);
      expect(seq4.sequences[0][1]).to.equal(seq1);
      expect(seq4.sequences[0][2]).to.equal(seq2);
      expect(seq4.sequences[0][3]).to.equal(seq3);
    });
  });
});
