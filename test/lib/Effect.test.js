var chai = require('chai');
var expect = chai.expect;
var Effect = require('../../lib/Effect');

var effect;

beforeEach(function () {
  effect = new Effect();
});

describe('Effect', function () {

  describe('createNode()', function () {
    describe('when not implemented by subclass', function () {
      it('should throw an error', function () {
        expect(function () {
          effect.createNode();
        }).to.throw('Required method "createNode" is not implemented');
      })
    });
  });

  describe('configureNode()', function () {
    describe('when not implemented by subclass', function () {
      it('should throw an error', function () {
        expect(function () {
          effect.configureNode();
        }).to.throw('Required method "configureNode" is not implemented');
      })
    });
  });

  describe('getNode(destinationId)', function () {

    beforeEach(function () {
      var count = 0;
      effect = new (Effect.extend({
        createNode: function () {
          return { id: ++count };
        },
        configureNode: function () {}
      }));
    });

    describe('when destinationId has not been passed before', function () {
      it('should return a new node', function () {
        var node1 = effect.getNode('foo');
        var node2 = effect.getNode('bar');
        expect(node1.id).to.equal(1);
        expect(node2.id).to.equal(2);
      });
    });

    describe('when destinationId has been passed before', function () {
      it('should return the same node again', function () {
        var node1 = effect.getNode('foo');
        var node2 = effect.getNode('foo');
        expect(node1.id).to.equal(1);
        expect(node2.id).to.equal(1);
        expect(node1).to.equal(node2);
      });
    });
  });
});
