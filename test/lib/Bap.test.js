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

  ['pattern', 'note'].forEach(function (name) {
    it('should expose factory for "' + name + '"', function () {
      expect(bap[name]).to.be.a('function');
    });
  });
});
