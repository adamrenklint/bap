var chai = require('chai');
var expect = chai.expect;
var Sequence = require('../../lib/Sequence');
var Pattern = require('../../lib/Pattern');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var sequence;

beforeEach(function () {
  sequence = new Sequence();
});

xdescribe('Sequence', function () {

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

  describe('sequences', function () {
    describe('when setting sequences', function () {
      it('should listen and forward changes on the new children', function () {
        var pattern = new Pattern();
        var seq = new Sequence();
        var spy = sinon.spy();
        seq.on('change:sequences', spy);
        seq.sequences = [[pattern]];
        expect(spy).to.have.been.calledOnce;
        pattern.trigger('change:channels');
        expect(spy).to.have.been.calledTwice;
      });
      it('should stop listening for changes on the previous children', function () {
        var pattern = new Pattern();
        var seq = new Sequence();
        var spy = sinon.spy();
        seq.on('change:sequences', spy);
        seq.sequences = [[pattern]];
        expect(spy).to.have.been.calledOnce;
        var pattern2 = new Pattern();
        seq.sequences = [[pattern2]];
        expect(spy).to.have.been.calledTwice;
        pattern.trigger('change:channels');
        expect(spy).to.have.been.calledTwice;
      });
      describe('when trying to set something other than an array of arrays of sequences', function () {
        it('should throw a meaningful error', function () {
          expect(function () {
            var seq = new Sequence();
            var pattern = new Pattern();
            seq.sequences = [pattern];
          }).to.throw(/Property 'sequences' must be of type sequence-array/);
        });
      });
    });
  });

  xdescribe('notes(returnOriginals)', function () {
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

  describe('tempo', function () {
    it('should return the tempo of the first sequence', function () {
      var pattern = new Pattern({ tempo: 95 });
      var pattern2 = new Pattern({ tempo: 105 });
      var pattern3 = new Pattern({ tempo: 25 });
      var seq = new Sequence([pattern, pattern2], pattern3);
      expect(seq.tempo).to.equal(95);
    });
    describe('when there is no sequences', function () {
      it('should return the global default (120)', function () {
        var seq = new Sequence();
        expect(seq.tempo).to.equal(120);
      });
    });
  });

  describe('bars', function () {
    it('should return the length of all child sequences', function () {
      var pattern = new Pattern({ tempo: 95 });
      var pattern2 = new Pattern({ bars: 4, tempo: 105 });
      var pattern3 = new Pattern({ tempo: 25 });
      var seq = new Sequence([pattern, pattern2], pattern3);
      expect(seq.bars).to.equal(5);
    });
    describe('when there are no child sequences', function () {
      it('should return 0', function () {
        var seq = new Sequence();
        expect(seq.bars).to.equal(0);
      });
    });
  });

  describe('beatsPerBar', function () {
    it('should return the beatsPerBar of the first sequence', function () {
      var pattern = new Pattern({ beatsPerBar: 5 });
      var pattern2 = new Pattern({ beatsPerBar: 6 });
      var pattern3 = new Pattern({ beatsPerBar: 2 });
      var seq = new Sequence([pattern, pattern2], pattern3);
      expect(seq.beatsPerBar).to.equal(5);
    });
    describe('when there is no sequences', function () {
      it('should return the global default (4)', function () {
        var seq = new Sequence();
        expect(seq.beatsPerBar).to.equal(4);
      });
    });
  });

  describe('tempoChanges()', function () {
    it('should return all tempo changes', function () {
      var pattern = new Pattern({ tempo: 95 });
      var pattern2 = new Pattern({ tempo: 105 });
      var pattern3 = new Pattern({ tempo: 25 });
      var seq = new Sequence([pattern, pattern2], pattern3, pattern3);
      var changes = seq.tempoChanges();
      expect(changes.length).to.equal(3);
      expect(changes[0][0]).to.equal('1.1.01');
      expect(changes[0][1].val).to.equal(95);
      expect(changes[1][0]).to.equal('1.4.96');
      expect(changes[1][1].val).to.equal(25);
      expect(changes[2][0]).to.equal('3.4.96');
      expect(changes[2][1].val).to.equal(95);
    });
  });

  describe('then(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = seq1.then(seq2);
      expect(seq3).not.to.equal(seq1);
      expect(seq3).to.be.instanceOf(Sequence);
    });
    it('should add passed sequences after', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = seq1.then(seq2, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(3);
      expect(seq4.sequences[0][0]).to.equal(seq1);
      expect(seq4.sequences[1][0]).to.equal(seq2);
      expect(seq4.sequences[2][0]).to.equal(seq2);
      expect(seq4.sequences[2][1]).to.equal(seq3);
    });
  });

  describe('after(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = seq1.after(seq2);
      expect(seq3).not.to.equal(seq1);
      expect(seq3).to.be.instanceOf(Sequence);
    });
    it('should add passed sequences before', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = seq1.after(seq2, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(3);
      expect(seq4.sequences[0][0]).to.equal(seq2);
      expect(seq4.sequences[1][0]).to.equal(seq2);
      expect(seq4.sequences[1][1]).to.equal(seq3);
      expect(seq4.sequences[2][0]).to.equal(seq1);
    });
  });

  describe('and(sequence...)', function () {
    it('should return a new sequence', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = seq1.and(seq2);
      expect(seq3).not.to.equal(seq1);
      expect(seq3).to.be.instanceOf(Sequence);
    });
    it('should flatten sequences and remove duplicates', function () {
      var pattern = new Pattern();
      var seq1 = new Sequence(pattern);
      var seq2 = new Sequence(pattern);
      var seq3 = new Sequence(pattern);
      var seq4 = seq1.and(seq2, [seq2, seq3]);
      expect(seq4.sequences.length).to.equal(1);
      expect(seq4.sequences[0].length).to.equal(3);
      expect(seq4.sequences[0][0]).to.equal(seq1);
      expect(seq4.sequences[0][1]).to.equal(seq2);
      expect(seq4.sequences[0][2]).to.equal(seq3);
    });
  });

  describe('_isOffsetWithinRange(offset, length, from, to)', function () {
    [
      [0, 2, 1, 2, true],
      [1, 2, 1, 2, true],
      [2, 2, 1, 2, false],
      [4, 2, 2, 4, false],
      [4, 2, 2, 4, false],
      [4, 2, 6, 1, true],
      [4, 2, 1, 2, false]
    ].forEach(function (test) {
      it('should parse offset ' + test[0] + ', length ' + test[1] + ' within range ' + test[2] + '-' + test[3] + ' right (' + test[4] + ')', function () {
        expect(sequence._isOffsetWithinRange(test[0], test[1], test[2], test[3])).to.equal(test[4]);
      });
    });
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
