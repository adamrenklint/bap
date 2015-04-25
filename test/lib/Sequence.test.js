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

  // describe('notes(returnOriginals)');
  // describe('tempoChanges()');
});
