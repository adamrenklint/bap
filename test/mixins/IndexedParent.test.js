var chai = require('chai');
var expect = chai.expect;
var Base = require('../../lib/Base');
var IndexedParent = require('../../lib/mixins/IndexedParent');

var base;

beforeEach(function () {
  base = new Base();
  IndexedParent.call(base);
});

describe('lib/mixins/IndexedParent', function () {

  describe('add', function () {
    it('should be a function', function () {
      expect(base.add).to.be.a('function');
    });
  });
});
