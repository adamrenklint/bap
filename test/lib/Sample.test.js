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

  xdescribe('Sample.getNewBufferTargetChannel(params, buffer)', function () {
    describe('when buffer has one channel', function () {
      ['left', 'right', 'merge', 'diff', null].forEach(function (channel) {
        describe('when params.channel is "' + channel + '"', function () {
          it('should target the first channel', function () {
            var params = { channel: channel };
            var buffer = { numberOfChannels: 1 };
            var result = Sample.getNewBufferTargetChannel(params, buffer);
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
          var result = Sample.getNewBufferTargetChannel(params, buffer);
          expect(result).to.equal(0);
        });
      });
      describe('when params.channel is "right"', function () {
        it('should target the second channel', function () {
          var params = { channel: 'right' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferTargetChannel(params, buffer);
          expect(result).to.equal(1);
        });
      });
      describe('when params.channel is "merge"', function () {
        it('should return a null target', function () {
          var params = { channel: 'merge' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferTargetChannel(params, buffer);
          expect(result).to.equal(null);
        });
      });
      describe('when params.channel is "diff"', function () {
        it('should return a null target', function () {
          var params = { channel: 'diff' };
          var buffer = { numberOfChannels: 2 };
          var result = Sample.getNewBufferTargetChannel(params, buffer);
          expect(result).to.equal(null);
        });
      });
    });
  });

  // describe('Sample.copyChannelData(buffer, original, startingPoint, targetChannel, params)', function () {
  //
  //   var firstChannel, secondChannel, original;
  //
  //   describe('when original buffer has two channels', function () {
  //
  //     beforeEach(function () {
  //       firstChannel = [0.1, 0.3, 0.1, -0.1, -0.3, -0.1];
  //       secondChannel = [0.1, 0.4, 0.1, -0.1, -0.4, -0.1];
  //       original = new MockBuffer({ numberOfChannels: 2 }, [
  //         firstChannel, secondChannel
  //       ]);
  //     });
  //
  //     describe('when target buffer has two channels', function () {
  //       it('should copy both channels exactly', function () {
  //         var buffer = new MockBuffer({ numberOfChannels: 2, length: 6 });
  //         Sample.copyChannelData(buffer, original, 0, null, {});
  //         expect(buffer.getChannelData(0).join()).to.equal(firstChannel.join());
  //         expect(buffer.getChannelData(1).join()).to.equal(secondChannel.join());
  //       });
  //     });
  //     describe('when target buffer has one channel', function () {
  //       describe('when target channel is defined', function () {
  //         describe('when a starting point is defined', function () {
  //           it('should copy the target channel from the starting point offset', function () {
  //             var buffer = new MockBuffer({ numberOfChannels: 1, length: 6 });
  //             Sample.copyChannelData(buffer, original, 2, 1, {});
  //             expect(buffer.getChannelData(0).join()).to.equal([0.1, -0.1, -0.4, -0.1, 0, 0].join());
  //           });
  //         });
  //         describe('when a starting point is not defined', function () {
  //
  //         });
  //       });
  //       describe('when target channel is not defined', function () {
  //
  //       });
  //     });
  //   });
  // });

  xdescribe('Sample.getNewBufferStartingPoint(params, buffer)', function () {
    describe('when params.trimToZeroCrossingPoint is true', function () {
      describe('when params.offset is 0', function () {
        describe('when params.reverse is true', function () {
          describe('when copying both channels of a stereo buffer', function () {
            it('should set the last pos>neg zero crossing on the first channel as starting point', function () {
              var params = { offset: 0, trimToZeroCrossingPoint: true };
              var buffer = new MockBuffer({ numberOfChannels: 2 }, [
                [-0.2, -0.1, 0.2, 0.5, 0.3, -0.1, -0.5, -0.1, 0.2, 0.4, 0.2],
                [-0.3, 0.1, 0.2, 0.6, 0.3, -0.1, -0.5, -0.2, -0.1, 0.2, 0.3]
              ]);
              var result = Sample.getNewBufferStartingPoint(params, buffer);
              expect(result).to.equal(3);
            });
          });
        });
        describe('when params.reverse is false', function () {
          it('should set the first neg>pos zero crossing as starting point', function () {
            var params = { offset: 0, trimToZeroCrossingPoint: true };
            var buffer = new MockBuffer({ numberOfChannels: 2 }, [
              [-0.2, -0.1, 0.2, 0.5, 0.3, -0.1, -0.5, -0.1, 0.2, 0.4, 0.2],
              [-0.3, 0.1, 0.2, 0.6, 0.3, -0.1, -0.5, -0.2, -0.1, 0.2, 0.3]
            ]);
            var result = Sample.getNewBufferStartingPoint(params, buffer);
            expect(result).to.equal(2);
          });
        });
      });
      describe('when params.offset is not 0', function () {
        describe('when params.reverse is true', function () {
          it('should set the last pos>neg zero crossing, before offset, as starting point', function () {
            // var params = { offset: 0.3, reverse: true, trimToZeroCrossingPoint: true };
            // var buffer = { sampleRate: 44100, length: 44100 };
            // var result = Sample.getNewBufferStartingPoint(params, buffer);
            // expect(result).to.equal(30870);
          });
        });
        describe('when params.reverse is false', function () {
          it('should set the first neg>pos zero crossing, after offset, as starting point', function () {
            // var params = { offset: 0.3, trimToZeroCrossingPoint: true };
            // var buffer = { sampleRate: 44100, length: 44100 };
            // var result = Sample.getNewBufferStartingPoint(params, buffer);
            // expect(result).to.equal(13230);
          });
        });
      });
    });
    describe('when params.trimToZeroCrossingPoint is false', function () {
      describe('when params.offset is 0', function () {
        it('should not offset starting point at all', function () {
          var params = { offset: 0, trimToZeroCrossingPoint: false };
          var buffer = { sampleRate: 44100, length: 44100 };
          var result = Sample.getNewBufferStartingPoint(params, buffer);
          expect(result).to.equal(0);
        });
      });
      describe('when params.offset is not 0', function () {
        describe('when params.reverse is true', function () {
          it('should add negative offset to starting point, counting from the end', function () {
            var params = { offset: 0.3, reverse: true, trimToZeroCrossingPoint: false };
            var buffer = { sampleRate: 44100, length: 44100 };
            var result = Sample.getNewBufferStartingPoint(params, buffer);
            expect(result).to.equal(30870);
          });
        });
        describe('when params.reverse is false', function () {
          it('should add positive offset to starting point, counting from the beginning', function () {
            var params = { offset: 0.3, trimToZeroCrossingPoint: false };
            var buffer = { sampleRate: 44100, length: 44100 };
            var result = Sample.getNewBufferStartingPoint(params, buffer);
            expect(result).to.equal(13230);
          });
        });
      });
    });
  });

  describe('Sample.getNewBufferSize(params, buffer)', function () {
    describe('when params.trimToZeroCrossingPoint is true', function () {
      describe('when params.loop is true', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0.5, trimToZeroCrossingPoint: true };
          var result = Sample.getNewBufferSize(params, 44100);
          expect(result).to.equal(22050);
        });
      });
      describe('when params.loop is false', function () {
        it('should add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0, trimToZeroCrossingPoint: true };
          var result = Sample.getNewBufferSize(params, 44100);
          expect(result).to.equal(44100 + Sample.silentTailSize);
        });
      });
    });
    describe('when params.trimToZeroCrossingPoint is false', function () {
      describe('when params.loop is true', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0.5, trimToZeroCrossingPoint: false };
          var result = Sample.getNewBufferSize(params, 44100);
          expect(result).to.equal(22050);
        });
      });
      describe('when params.loop is false', function () {
        it('should not add Sample.silentTailSize', function () {
          var params = { length: 1, loop: 0, trimToZeroCrossingPoint: false };
          var result = Sample.getNewBufferSize(params, 44100);
          expect(result).to.equal(44100);
        });
      });
    });
  });
});
