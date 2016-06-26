var chai = require('chai');
var expect = chai.expect;
var Sample = require('../../lib/Sample');

var sample;

beforeEach(function () {
  sample = new Sample();
});

describe('Sample', function () {

  describe('_getPlaybackRate(params)', function () {
    [
        [0, 1],
        [1, 1.0594630943592953],
        [2, 1.122462048309373],
        [7, 1.4983070768766815],
        [12,2],
        [19, 2.996614153753363],
        [24, 4],
        [-1, 0.9438743126816935],
        [-2, 0.8908987181403393],
        [-5, 0.7491535384383408],
        [-12, 0.5],
        [-17, 0.3745767692191704],
        [-24, 0.25]
    ].forEach(function (test) {
      it('should convert pitch ' + test[0] + ' to rate ' + test[1], function () {
        expect(sample._getPlaybackRate({ pitch: test[0] })).to.equal(test[1]);
      });
    });
  });
});
