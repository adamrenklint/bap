var chai = require('chai');
var expect = chai.expect;
var Pattern = require('../../lib/Pattern');
var Channel = require('../../lib/Channel');

var pattern;

beforeEach(function () {
  pattern = new Pattern();
});

describe('Pattern', function () {

  describe('channel(id, channel)', function () {
    describe('when id is not a positive number', function () {
      describe('when channel is not a Channel instance', function () {
        it('should return a blank channel', function () {
          var channel = pattern.channel();
          expect(channel).to.be.instanceOf(Channel);
        });
        it('should assign the blank channel to the next id', function () {
          var channel = pattern.channel();
          expect(channel.id).to.equal(1);
          var channel2 = pattern.channel();
          expect(channel2.id).to.equal(2);
        });
      });
      describe('when channel is a Channel instance', function () {
        it('should assign this channel to the next id', function () {
          var channel = new Channel();
          pattern.channel();
          pattern.channel(channel)
          expect(channel.id).to.equal(2);
        });
        it('should be chainable', function () {
          expect(pattern.channel(new Channel())).to.equal(pattern);
        });
      });
    });
    describe('when id is a positive number', function () {
      describe('when an existing channel exists on id', function () {
        describe('when channel is not a Channel instance', function () {
          it('should return the existing channel', function () {
            var existing = pattern.channel(3);
            expect(pattern.channel(3)).to.equal(existing);
          });
        });
        describe('when channel is a Channel instance', function () {
          it('should assign this channel to id', function () {
            var existing = pattern.channel(3);
            var channel = new Channel();
            pattern.channel(3, channel);
            expect(channel.id).to.equal(3);
          });
          it('should remove any channel previously assinged to id', function () {
            var existing = pattern.channel(3);
            var channel = new Channel();
            pattern.channel(3, channel);
            expect(pattern.channels.length).to.equal(1);
            expect(pattern.channels.get(3)).to.equal(channel);
          });
          it('should be chainable', function () {
            expect(pattern.channel(3, new Channel())).to.equal(pattern);
          });
        });
      });
      describe('when no channel exists on id', function () {
        describe('when channel is not a Channel instance', function () {
          it('should return a blank channel', function () {
            var channel = pattern.channel(3);
            expect(channel).to.be.instanceOf(Channel);
          });
          it('should assign the blank channel to id', function () {
            var channel = pattern.channel(3);
            expect(channel.id).to.equal(3);
          });
        });
        describe('when channel is a Channel instance', function () {
          it('should assign this channel to id', function () {
            var channel = new Channel();
            pattern.channel(3, channel);
            expect(channel.id).to.equal(3);
          });
          it('should be chainable', function () {
            expect(pattern.channel(3, new Channel())).to.equal(pattern);
          });
        });
      });
    });
  });
});
