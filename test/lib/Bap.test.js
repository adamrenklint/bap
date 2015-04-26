var chai = require('chai');
var expect = chai.expect;
var Bap = require('../../lib/Bap');
var AudioContextMock = require('../../node_modules/dilla/test/mocks/AudioContext');
var context = require('../../lib/utils/context');
context.set(new AudioContextMock());

var bap;

before(function () {
  bap = new Bap();
});

describe('Bap', function () {

  [
    'kit',
    'slot',
    'layer',
    'oscillator',
    'sample',
    'pattern',
    'sequence',
    'channel',
    'note',
  ].forEach(function (name) {
    it('should expose factory for "' + name + '"', function () {
      expect(bap[name]).to.be.a('function');
      expect(function () {
        bap[name]();
      }).not.to.throw(Error);
    });
  });

  describe('loadingState', function () {
    describe('when loadingState.loading changes', function () {
      it('should reflect the value in vent.loading', function () {
        expect(bap.vent.loading).to.be.falsy;
        bap.vent.trigger('loadingState:add', 'foo/bar');
        expect(bap.vent.loading).to.be.true;
        bap.vent.trigger('loadingState:add', 'foo/bar');
        expect(bap.vent.loading).to.be.true;
        bap.vent.trigger('loadingState:remove', 'foo/bar');
        expect(bap.vent.loading).to.be.falsy;
        bap.vent.trigger('loadingState:remove', 'foo/bar');
        expect(bap.vent.loading).to.be.falsy;
      });
    });
  });
});
