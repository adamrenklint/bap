var chai = require('chai');
var expect = chai.expect;
var Params = require('../../lib/Params');

describe('Params', function () {

  describe('fromSources([sources...])', function () {
    it('should ignore null sources', function () {
      var one = new Params({ volume: 50 });
      var two = new Params({ volume: 50 });
      expect(Params.fromSources([one, null, two]).volume).to.equal(25);
    });
    describe('volume', function () {
      it('should multiply the values', function () {
        var one = new Params({ volume: 50 });
        var two = new Params({ volume: 50 });
        expect(Params.fromSources([one, two]).volume).to.equal(25);
      });
    });
    describe('pan', function () {
      it('should add the values', function () {
        var one = new Params({ pan: 50 });
        var two = new Params({ pan: 50 });
        var three = new Params({ pan: -100 });
        var four = new Params({ pan: -50 });
        var five = new Params({ pan: -50 });
        expect(Params.fromSources([one, two]).pan).to.equal(100);
        expect(Params.fromSources([one, two, three]).pan).to.equal(0);
        expect(Params.fromSources([four, five]).pan).to.equal(-100);
        expect(Params.fromSources([four, five, three]).pan).to.equal(-100);
      });
    });
    describe('pitch', function () {
      it('should add the values', function () {
        var one = new Params({ pitch: 50 });
        var two = new Params({ pitch: 50 });
        var three = new Params({ pitch: -100 });
        var four = new Params({ pitch: -50 });
        var five = new Params({ pitch: -50 });
        expect(Params.fromSources([one, two]).pitch).to.equal(100);
        expect(Params.fromSources([one, two, three]).pitch).to.equal(0);
        expect(Params.fromSources([four, five]).pitch).to.equal(-100);
        expect(Params.fromSources([four, five, three]).pitch).to.equal(-200);
      });
    });
    ['attack', 'release', 'length', 'duration'].forEach(function (key) {
      describe(key, function () {
        it('should overwrite with the most important value', function () {
          var one = {}, two = {}, three = {};
          one[key] = 5;
          two[key] = 10;
          three[key] = 2;
          expect(Params.fromSources([new Params(one), new Params(two), new Params(three)])[key]).to.equal(5);
        });
      });
    });
    describe('attack + release', function () {
      describe('when length is shorter than attack and release together', function () {
        it('should reduce them both proportionally', function () {
          var params = { length: 0.5, attack: 0.4, release: 0.3 };
          var result = Params.fromSources([new Params(params)]);
          expect(result.length).to.equal(0.5);
          expect(result.attack).to.equal((0.5/0.7) * 0.4);
          expect(result.release).to.equal((0.5/0.7) * 0.3);
        });
      });
    });
  });
});
