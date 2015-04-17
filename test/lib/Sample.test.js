var chai = require('chai');
var expect = chai.expect;
var Sample = require('../../lib/Sample');

var sample;

beforeEach(function () {
  sample = new Sample();
});

describe('Sample', function () {

  describe('getPlaybackRate(params)', function () {
    [
      [0, 1],
      [50, 1.5],
      [100, 2],
      [200, 3],
      [250, 3.5],
      [400, 5],
      [500, 6],
      [-50, 0.75],
      [-100, 0.5],
      [-150, 0.375],
      [-200, 0.25],
      [-250, 0.1875],
      [-300, 0.125],
      [-400, 0.0625],
      [-500, 0.03125]
    ].forEach(function (test) {
      it('should convert pitch ' + test[0] + ' to rate ' + test[1], function () {
        expect(sample.getPlaybackRate({ pitch: test[0] })).to.equal(test[1]);
      });
    });
  });
});
