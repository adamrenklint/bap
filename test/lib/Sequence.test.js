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
          }).to.throw(/'sequences' must be of type sequence-grid/);
        });
      });
    });
  });

  describe('notes(bar, beat, tick)', function () {
    describe('when bar is not defined', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          sequence.notes(1);
        }).to.throw('bar is not within sequence length');
      });
    });
    describe('when bar is defined', function () {
      describe('when bar is higher than length', function () {
        it('should throw a meaningful error', function () {
          expect(function () {
            sequence.notes(1);
          }).to.throw('bar is not within sequence length');
        });
      });
      describe('when beat is not defined', function () {
        it('should return all notes on that bar', function () {
          var pattern1 = new Pattern({ bars: 2 });
          pattern1.channel(1).add(
            ['*.1.01', 'A1'],
            ['2.3.3', 'A2']
          );
          pattern2 = new Pattern();
          pattern2.channel(1).add(
            ['1.*.13', 'B1']
          );
          var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
          var notes = seq.notes(2);

          expect(notes).to.be.a('object');
          expect(Object.keys(notes).length).to.equal(1);

          expect(notes[2].length).to.equal(5);
          expect(notes[2][0].position).to.equal('1.1.01');
          expect(notes[2][1].position).to.equal('1.1.13');
          expect(notes[2][2].position).to.equal('1.2.13');
          expect(notes[2][3].position).to.equal('1.3.13');
          expect(notes[2][4].position).to.equal('1.4.13');
        });
        describe('when there are no notes on that bar', function () {
          it('should return an empty array', function () {
            var pattern1 = new Pattern({ bars: 2 });
            pattern2 = new Pattern();
            var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
            var notes = seq.notes(2);
            expect(notes).to.be.a('object');
            expect(Object.keys(notes).length).to.equal(1);
            expect(notes[2]).to.be.a('array');
            expect(notes[2].length).to.equal(0);
          })
        });
      });
      describe('when beat is defined', function () {
        describe('when tick is not defined', function () {
          it('should return all notes on that bar and beat', function () {
            var pattern1 = new Pattern({ bars: 2 });
            pattern1.channel(1).add(
              ['*.1.01', 'A1'],
              ['2.3.3', 'A2']
            );
            pattern2 = new Pattern();
            pattern2.channel(1).add(
              ['1.*.13', 'B1']
            );
            var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
            var notes = seq.notes(2, 1);

            expect(notes).to.be.a('object');
            expect(Object.keys(notes).length).to.equal(1);

            expect(notes[2].length).to.equal(2);
            expect(notes[2][0].position).to.equal('1.1.01');
            expect(notes[2][1].position).to.equal('1.1.13');
          });
          describe('when there are no notes on that bar and beat', function () {
            it('should return an empty array', function () {
              var pattern1 = new Pattern({ bars: 2 });
              pattern2 = new Pattern();
              var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
              var notes = seq.notes(2, 1);

              expect(notes).to.be.a('object');
              expect(Object.keys(notes).length).to.equal(1);
              expect(notes[2]).to.be.a('array');
              expect(notes[2].length).to.equal(0);
            })
          });
        });
        describe('when tick is defined', function () {
          it('should return all notes on that bar, beat and tick', function () {
          var pattern1 = new Pattern({ bars: 2 });
            pattern1.channel(1).add(
              ['*.1.01', 'A1'],
              ['2.3.3', 'A2']
            );
            pattern2 = new Pattern();
            pattern2.channel(1).add(
              ['1.*.13', 'B1']
            );
            var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
            var notes = seq.notes(2, 1, 13);

            expect(notes).to.be.a('object');
            expect(Object.keys(notes).length).to.equal(1);
            expect(notes[2].length).to.equal(1);
            expect(notes[2][0].position).to.equal('1.1.13');
          });
          describe('when there are no notes on that bar, beat and tick', function () {
            it('should return an empty array', function () {
              var pattern1 = new Pattern({ bars: 2 });
              pattern2 = new Pattern();
              var seq = new Sequence(pattern2, [pattern1, pattern2], pattern1);
              var notes = seq.notes(2, 1, 13);

              expect(notes).to.be.a('object');
              expect(Object.keys(notes).length).to.equal(1);
              expect(notes[2]).to.be.a('array');
              expect(notes[2].length).to.equal(0);
            });
          });
        });
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

  describe('patterns(bar)', function () {
    describe('when bar is not a number', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          sequence.patterns('foo');
        }).to.throw('bar is not a number');
      });
    });
    describe('when bar is higher than sequence length', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          sequence.patterns(1);
        }).to.throw('bar is not within sequence length');
      });
    });
    describe('when bar is 0 or lower', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          sequence.patterns(-1);
        }).to.throw('bar is not within sequence length');
        expect(function () {
          sequence.patterns(0);
        }).to.throw('bar is not within sequence length');
      });
    });
    it('should return an object', function () {
      var pattern = new Pattern();
      sequence = new Sequence(pattern, pattern);
      var ret = sequence.patterns(1);
      expect(ret).to.be.a('object');
    });
    it('should find the right patterns', function () {
      var pattern = new Pattern();
      var pattern2 = new Pattern();
      sequence = new Sequence([pattern, pattern2], pattern);

      var ret = sequence.patterns(1);
      expect(ret).to.be.a('object');
      expect(Object.keys(ret).length).to.equal(1);
      expect(ret[0].length).to.equal(2);
      expect(ret[0][0]).to.equal(pattern);
      expect(ret[0][1]).to.equal(pattern2);

      ret = sequence.patterns(2);
      expect(ret).to.be.a('object');
      expect(Object.keys(ret).length).to.equal(1);
      expect(ret[0].length).to.equal(1);
      expect(ret[0][0]).to.equal(pattern);
    });
    it('should group patterns by their offset to bar', function () {
      var pattern = new Pattern({ bars: 2 });
      var pattern2 = new Pattern();
      var seq = new Sequence(pattern2, pattern2);
      sequence = new Sequence(pattern, [pattern, seq]);
      var ret = sequence.patterns(4);
      expect(ret).to.be.a('object');
      expect(Object.keys(ret).length).to.equal(2);
      expect(ret[1].length).to.equal(1);
      expect(ret[1][0]).to.equal(pattern);
      expect(ret[0].length).to.equal(1);
      expect(ret[0][0]).to.equal(pattern2);
    });
    it('should group nested sequences and patterns by correct offset', function () {
      var longPattern = new Pattern({ bars: 4 });
      var middlePattern = new Pattern({ bars: 2 });
      var shortPattern = new Pattern();
      var seq1 = new Sequence(shortPattern, shortPattern);
      var seq2 = new Sequence([seq1, middlePattern]);
      var seq3 = new Sequence(seq2, seq2);
      var seq4 = new Sequence([seq3, longPattern]);
      sequence = new Sequence(seq4, seq4);

      var ret = sequence.patterns(8);
      expect(ret).to.be.a('object');
      expect(Object.keys(ret).length).to.equal(3);
      expect(ret[3].length).to.equal(1);
      expect(ret[3][0]).to.equal(longPattern);
      expect(ret[1].length).to.equal(1);
      expect(ret[1][0]).to.equal(middlePattern);
      expect(ret[0].length).to.equal(1);
      expect(ret[0][0]).to.equal(shortPattern);
    });
  });
});
