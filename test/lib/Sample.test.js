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
      [-275, 0.15625],
      [-300, 0.125],
      [-400, 0.0625],
      [-500, 0.03125]
    ].forEach(function (test) {
      it('should convert pitch ' + test[0] + ' to rate ' + test[1], function () {
        expect(sample._getPlaybackRate({ pitch: test[0] })).to.equal(test[1]);
      });
    });
  });

  describe('Sample.getNewBufferChannelCount(params, buffer)', function () {
    [
      [2, 'left', 1],
      [2, 'right', 1],
      [2, 'merge', 1],
      [2, 'diff', 1],
      [2, null, 2],
      [1, 'left', 1],
      [1, 'right', 1],
      [1, 'merge', 1],
      [1, 'diff', 1],
      [1, null, 1]
    ].forEach(function (test) {
      describe('when a buffer with ' + test[0] + ' is processed with params.channel defined as "' + test[1] + '"', function () {
        it('should return the correct new channel count (' + test[2] + ')', function () {
          var params = { channel: test[1] };
          var buffer = { numberOfChannels: test[0] };
          var result = Sample.getNewBufferChannelCount(params, buffer);
          expect(result).to.equal(test[2]);
        });
      });
    });
  });

  describe('Sample.getNewBufferSize(params, buffer)', function () {
    describe('when params.trimToZeroCrossingPoint is true', function () {
      describe('when params.loop is true', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0.5, trimToZeroCrossingPoint: true };
          var buffer = { sampleRate: 44100 };
          var result = Sample.getNewBufferSize(params, buffer);
          expect(result).to.equal(22050);
        });
      });
      describe('when params.loop is false', function () {
        it('should add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0, trimToZeroCrossingPoint: true };
          var buffer = { sampleRate: 44100 };
          var result = Sample.getNewBufferSize(params, buffer);
          expect(result).to.equal(44100 + Sample.silentTailSize);
        });
      });
    });
    describe('when params.trimToZeroCrossingPoint is false', function () {
      describe('when params.loop is true', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0.5, trimToZeroCrossingPoint: false };
          var buffer = { sampleRate: 44100 };
          var result = Sample.getNewBufferSize(params, buffer);
          expect(result).to.equal(22050);
        });
      });
      describe('when params.loop is false', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0, trimToZeroCrossingPoint: false };
          var buffer = { sampleRate: 44100 };
          var result = Sample.getNewBufferSize(params, buffer);
          expect(result).to.equal(44100);
        });
      });
    });
  });
});
