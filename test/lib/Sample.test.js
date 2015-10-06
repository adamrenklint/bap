var chai = require('chai');
var expect = chai.expect;
var Sample = require('../../lib/Sample');

var sample;

beforeEach(function () {
  sample = new Sample();
});

function MockBuffer(params, channels) {
  this.numberOfChannels = params.numberOfChannels;
  this.sampleRate = 44100;
  this.length = channels && channels[0].length || params.length || 0;
  if (!channels || !channels.length) {
    channels = [];
    for (var i = 0, max = this.numberOfChannels; i < max; i++) {
      channels[i] = [];
      for (var j = 0, jMax = this.length; j < jMax; j++) {
        channels[i][j] = 0;
      }
    }
  }
  this.getChannelData = function (index) {
    return channels[index];
  };
}

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

  describe('Sample.getNewBufferSourceChannel(params, buffer)', function () {
    describe('when buffer has one channel', function () {
      ['left', 'right', 'merge', 'diff', null].forEach(function (channel) {
        describe('when params.channel is "' + channel + '"', function () {
          it('should target the first channel', function () {
            var params = { channel: channel };
            var buffer = { numberOfChannels: 1 };
            var result = Sample.getNewBufferSourceChannel(params, buffer);
            expect(result).to.equal(0);
          });
        });
      });
    });
    describe('when buffer has two channels', function () {
      describe('when params.channel is "left"', function () {
        it('should target the first channel', function () {
          var params = { channel: 'left' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferSourceChannel(params, buffer);
          expect(result).to.equal(0);
        });
      });
      describe('when params.channel is "right"', function () {
        it('should target the second channel', function () {
          var params = { channel: 'right' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferSourceChannel(params, buffer);
          expect(result).to.equal(1);
        });
      });
      describe('when params.channel is "merge"', function () {
        it('should return a null target', function () {
          var params = { channel: 'merge' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferSourceChannel(params, buffer);
          expect(result).to.equal(null);
        });
      });
      describe('when params.channel is "diff"', function () {
        it('should return a null target', function () {
          var params = { channel: 'diff' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferSourceChannel(params, buffer);
          expect(result).to.equal(null);
        });
      });
    });
  });

  describe('Sample.getNewBufferSourceStartIndex(params, buffer)', function () {
    describe('when params.offset is 0', function () {
      it('should return the first frame index', function () {
        var params = { offset: 0 };
        var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 });
        var result = Sample.getNewBufferSourceStartIndex(params, buffer);
        expect(result).to.equal(0);
      });
    });
    describe('when params.offset is not 0', function () {
      describe('when offset is more than buffer.duration', function () {
        it('should throw an error', function () {
          expect(function () {
            var params = { offset: 7 };
            var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
            Sample.getNewBufferSourceStartIndex(params, buffer);
          }).to.throw('Invalid buffer source start index');
        });
      });
      describe('when offset is equal to buffer.duration', function () {
        it('should throw an error', function () {
          expect(function () {
            var params = { offset: 6 };
            var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
            Sample.getNewBufferSourceStartIndex(params, buffer);
          }).to.throw('Invalid buffer source start index');
        });
      });
      describe('when offset is less than buffer.duration', function () {
        it('should return the offset in frames', function () {
          var params = { offset: 4 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
          var result = Sample.getNewBufferSourceStartIndex(params, buffer);
          expect(result).to.equal(4 * 44100);
        });
      });
    });
  });

  describe('Sample.getNewBufferTargetStartIndex(params)', function () {
    describe('when params.trimToZeroCrossingPoint is true', function () {
      describe('when params.reverse is false', function () {
        it('should return 0', function () {
          var params = { trimToZeroCrossingPoint: true, reverse: false };
          var result = Sample.getNewBufferTargetStartIndex(params);
          expect(result).to.equal(0);
        });
      });
      describe('when params.reverse is true', function () {
        describe('when params.loop is 0', function () {
          it('should return offset by Sample.silentTailSize', function () {
            var params = { trimToZeroCrossingPoint: true, reverse: true, loop: 0 };
            var result = Sample.getNewBufferTargetStartIndex(params);
            expect(result).to.equal(Sample.silentTailSize);
          });
        });
        describe('when params.loop is not 0', function () {
          it('should return 0', function () {
            var params = { trimToZeroCrossingPoint: true, reverse: true, loop: 1.2 };
            var result = Sample.getNewBufferTargetStartIndex(params);
            expect(result).to.equal(0);
          });
        });
      });
    });
    describe('when params.trimToZeroCrossingPoint is false', function () {
      describe('when params.reverse is false', function () {
        it('should return 0', function () {
          var params = { trimToZeroCrossingPoint: false, reverse: false };
          var result = Sample.getNewBufferTargetStartIndex(params);
          expect(result).to.equal(0);
        });
      });
      describe('when params.reverse is true', function () {
        it('should return 0', function () {
          var params = { trimToZeroCrossingPoint: false, reverse: true };
          var result = Sample.getNewBufferTargetStartIndex(params);
          expect(result).to.equal(0);
        });
      });
    });
  });

  describe('Sample.getNewBufferCopyLength(params, buffer)', function () {
    describe('when params.offset is 0', function () {
      describe('when params.length is less than buffer.duration', function () {
        it('should return params.length in frames', function () {
          var params = { offset: 0, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(88200);
        });
      });
      describe('when params.length is equal to buffer.duration', function () {
        it('should return params.length in frames', function () {
          var params = { offset: 0, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 2 * 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(88200);
        });
      });
      describe('when params.length is more than buffer.duration', function () {
        it('should return buffer.length', function () {
          var params = { offset: 0, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(44100);
        });
      });
    });
    describe('when params.offset is not 0', function () {
      describe('when params.length + params.offset is less than buffer.duration', function () {
        it('should return params.length in frames', function () {
          var params = { offset: 1, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(88200);
        });
      });
      describe('when params.length + params.offset is equal to buffer.duration', function () {
        it('should return params.length in frames', function () {
          var params = { offset: 4, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(88200);
        });
      });
      describe('when params.length + params.offset is more than buffer.duration', function () {
        it('should return buffer.length - params.offset in frames', function () {
          var params = { offset: 5, length: 2 };
          var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 * 44100 });
          var result = Sample.getNewBufferCopyLength(params, buffer);
          expect(result).to.equal(44100);
        });
      });
    });
  });

  describe('Sample.getNewBufferRealLength(params, copyLength)', function () {
    describe('when params.trimToZeroCrossingPoint is true', function () {
      describe('when params.loop is 0', function () {
        it('should return copyLength + Sample.silentTailSize', function () {
          var params = { trimToZeroCrossingPoint: true, loop: 0 };
          var result = Sample.getNewBufferRealLength(params, 44100);
          expect(result).to.equal(44100 + Sample.silentTailSize);
        });
      });
      describe('when params.loop is not 0', function () {
        it('should return copyLength', function () {
          var params = { trimToZeroCrossingPoint: true, loop: 1 };
          var result = Sample.getNewBufferRealLength(params, 44100);
          expect(result).to.equal(44100);
        });
      });
    });
    describe('when params.trimToZeroCrossingPoint is false', function () {
      it('should return copyLength', function () {
        var params = { trimToZeroCrossingPoint: false, loop: 0 };
        var result = Sample.getNewBufferRealLength(params, 44100);
        expect(result).to.equal(44100);
      });
    });
  });

  describe('Sample.copyChannelData(originalBuffer, outputBuffer, sourceChannel, targetChannel, startIndex, targetStartIndex, copyLength)', function () {
    var originalBuffer = new MockBuffer({ numberOfChannels: 2 }, [
      [0.1, 0.3, 0.1, -0.1, -0.3, -0.1],
      [0.1, 0.4, 0.1, -0.1, -0.4, -0.1]
    ]);
    describe('when startIndex is 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.copyChannelData(originalBuffer, outputBuffer, 1, 0, 0, 0, 3);
          expect(outputBuffer.getChannelData(0).join()).to.equal([0.1, 0.4, 0.1, 0].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.copyChannelData(originalBuffer, outputBuffer, 1, 0, 0, 1, 3);
          expect(outputBuffer.getChannelData(0).join()).to.equal([0, 0.1, 0.4, 0.1].join());
        });
      });
    });
    describe('when startIndex is not 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.copyChannelData(originalBuffer, outputBuffer, 1, 0, 1, 1, 3);
          expect(outputBuffer.getChannelData(0).join()).to.equal([0, 0.4, 0.1, -0.1].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.copyChannelData(originalBuffer, outputBuffer, 1, 0, 1, 0, 3);
          expect(outputBuffer.getChannelData(0).join()).to.equal([0.4, 0.1, -0.1, 0].join());
        });
      });
    });
  });

  describe('Sample.diffChannelsData(originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength)', function () {
    var originalBuffer = new MockBuffer({ numberOfChannels: 2 }, [
      [0.1, 0.4, 0.3, -0.3, -0.3, -0.1],
      [0.1, 0.3, 0.1, -0.1, -0.4, -0.1]
    ]);
    describe('when startIndex is 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.diffChannelsData(originalBuffer, outputBuffer, 0, 0, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0, 0.1, 0.2, 0].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.diffChannelsData(originalBuffer, outputBuffer, 0, 1, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0, 0, 0.1, 0.2].join());
        });
      });
    });
    describe('when startIndex is not 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.diffChannelsData(originalBuffer, outputBuffer, 1, 1, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0, 0.1, 0.2, -0.2].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.diffChannelsData(originalBuffer, outputBuffer, 1, 0, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0.1, 0.2, -0.2, 0].join());
        });
      });
    });
  });

  describe('Sample.mergeChannelsData(originalBuffer, outputBuffer, startIndex, targetStartIndex, copyLength)', function () {
    var originalBuffer = new MockBuffer({ numberOfChannels: 2 }, [
      [0.1, 0.4, 0.3, -0.3, -0.3, -0.1],
      [0.1, 0.3, 0.1, -0.1, -0.4, -0.1]
    ]);
    describe('when startIndex is 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.mergeChannelsData(originalBuffer, outputBuffer, 0, 0, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0.2, 0.7, 0.4, 0].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.mergeChannelsData(originalBuffer, outputBuffer, 0, 1, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0, 0.2, 0.7, 0.4].join());
        });
      });
    });
    describe('when startIndex is not 0', function () {
      describe('when targetStartIndex is equal to startIndex', function () {
        it('should copy from startIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.mergeChannelsData(originalBuffer, outputBuffer, 1, 1, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0, 0.7, 0.4, -0.4].join());
        });
      });
      describe('when targetStartIndex is not equal to startIndex', function () {
        it('should copy from startIndex to targetStartIndex', function () {
          var outputBuffer = new MockBuffer({ numberOfChannels: 1, length: 4 });
          Sample.mergeChannelsData(originalBuffer, outputBuffer, 1, 0, 3);
          expect(outputBuffer.getChannelData(0).map(function (n) {
            return n > 0 || n < 0 ? n.toFixed(1) : n;
          }).join()).to.equal([0.7, 0.4, -0.4, 0].join());
        });
      });
    });
  });

  describe('Sample.trimStartToZeroCrossingPoint(buffer, channel)', function () {
    it('should mute all frames before first neg>pos zero crossing', function () {
      var buffer = new MockBuffer({ numberOfChannels: 1 }, [
        [-0.3, -0.1, 0.1, 0.3, 0.1, -0.1, -0.4, -0.1, 0.2, 0.3]
      ]);
      Sample.trimStartToZeroCrossingPoint(buffer, 0);
      expect(buffer.getChannelData(0).join()).to.equal([
        0, 0, 0.1, 0.3, 0.1, -0.1, -0.4, -0.1, 0.2, 0.3
      ].join());
    });
  });

  describe('Sample.trimEndToZeroCrossingPoint(buffer, channel)', function () {
    it('should mute all frames after last pos>neg zero crossing', function () {
      var buffer = new MockBuffer({ numberOfChannels: 1 }, [
        [-0.3, -0.1, 0.1, 0.3, 0.1, -0.1, -0.4, -0.1, 0.2, 0.3]
      ]);
      Sample.trimEndToZeroCrossingPoint(buffer, 0);
      expect(buffer.getChannelData(0).join()).to.equal([
        -0.3, -0.1, 0.1, 0.3, 0.1, -0.1, -0.4, -0.1, 0, 0
      ].join());
    });
  });
});
