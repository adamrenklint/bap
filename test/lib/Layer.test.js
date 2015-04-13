var chai = require('chai');
var expect = chai.expect;
var Layer = require('../../lib/Layer');

var layer;

beforeEach(function () {
  layer = new Layer();
});

describe('Layer', function () {

  describe('params(sources...)', function () {
    describe('volume (100-based)', function () {
      it('should multiply the values', function () {
        var one = { volume: 50 };
        var two = { volume: 50 };
        expect(layer.params(one, two).volume).to.equal(25);
      });
      it('should ignore negative values', function () {
        var one = { volume: 50 };
        var two = { volume: -10 };
        var three = { volume: 50 };
        expect(layer.params(one, two, three).volume).to.equal(25);
      });
    });
    ['pan', 'pitch'].forEach(function (key) {
      describe(key + ' (0-based)', function () {
        it('should add the values', function () {
          var one = {}, two = {}, three = {};
          one[key] = 50;
          two[key] = 50;
          three[key] = -10;
          expect(layer.params(one, two)[key]).to.equal(100);
          expect(layer.params(one, two, three)[key]).to.equal(90);
        });
        it('should normalize for negative values', function () {
          var one = {}, two = {}, three = {};
          one[key] = -50;
          two[key] = -50;
          three[key] = 50;
          expect(layer.params(one, two)[key]).to.equal(-100);
          expect(layer.params(one, two, three)[key]).to.equal(-50);
        });
      });
    });
    ['attack', 'release', 'length', 'duration'].forEach(function (key) {
      describe(key, function () {
        it('should overwrite with the most important value', function () {
          var one = {}, two = {}, three = {};
          one[key] = 5;
          two[key] = 10;
          three[key] = 2;
          expect(layer.params(one, two, three)[key]).to.equal(5);
        });
      });
    });
  });
});
