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
      expect(model.paddedPosition()).to.equal('00001.00001.00012');
    });
    it('should replace expressions with zeros', function () {
      model.position = '1.*.01';
      expect(model.paddedPosition()).to.equal('00001.00000.00001');
      model.position = '*.*.*';
      expect(model.paddedPosition()).to.equal('00000.00000.00000');
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
});
