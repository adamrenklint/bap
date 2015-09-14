var chai = require('chai');
var expect = chai.expect;
var PositionModel = require('../../lib/PositionModel');
var model;

beforeEach(function () {
  model = new PositionModel();
});

describe('PositionModel', function () {

  describe('paddedPosition()', function () {
    it('should return the position padded with zeros', function () {
      model.position = '1.1.12';
      expect(model.paddedPosition()).to.equal('001.001.012');
    });
    it('should not replace expressions with zeros', function () {
      model.position = '1.*.01';
      expect(model.paddedPosition()).to.equal('001.00*.001');
      model.position = '*.*.*';
      expect(model.paddedPosition()).to.equal('00*.00*.00*');
    });
  });

  describe('_updatePositionFromFragments()', function () {
    describe('when bar, beat or tick contains an expression', function () {
      it('should encode position with that expression', function () {
        model.position = '1.*.01';
        model.bar += 1;
        expect(model.position).to.equal('2.*.01');
      });
    });
    describe('when bar, bat or tick does not contain an expression', function () {
      it('should encode the position', function () {
        model.position = '1.1.12';
        model.beat += 2;
        expect(model.position).to.equal('1.3.12');
      });
    });
    describe('when tick is null and position is 0.0.00', function () {
      it('should not pad the tick more', function () {
        model.position = '0.0.00';
        model._updatePositionFromFragments();
        expect(model.position).to.equal('0.0.00');
      });
    });
  });

  describe('fragments()', function () {
    it('should return the current position as fragments', function () {
      model.position = '2.3.12';
      var fragments = model.fragments();
      expect(fragments[0]).to.equal(2);
      expect(fragments[1]).to.equal(3);
      expect(fragments[2]).to.equal(12);
    });
  });

  describe('PositionModel.fragments(position)', function () {
    it('should return the fragments as numbers', function () {
      var fragments = PositionModel.fragments('1.2.03');
      expect(fragments[0]).to.equal(1);
      expect(fragments[1]).to.equal(2);
      expect(fragments[2]).to.equal(3);
    });
    it('should return fragments with expressions as strings', function () {
      var fragments = PositionModel.fragments('1.2%1.03');
      expect(fragments[0]).to.equal(1);
      expect(fragments[1]).to.equal('2%1');
      expect(fragments[2]).to.equal(3);
    });
  });
});
