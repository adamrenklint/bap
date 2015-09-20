var chai = require('chai');
var expect = chai.expect;
var Model = require('../../lib/Model');
var connectable = require('../../lib/mixins/connectable');

ConnectableModel = Model.extend(connectable);
var instance;

beforeEach(function () {
  instance = new ConnectableModel();
});

describe('mixins/connectable', function () {

  describe('connect(node)', function () {
    it('should add node to connections array', function () {
      var node = { foo: 'bar' };
      instance.connect(node);
      expect(instance.connections).to.contain(node);
    });
    it('should be chainable', function () {
      expect(instance.connect({})).to.equal(instance);
    });
  });

  describe('connect(chain)', function () {
    it('should add all nodes in chain to connections array', function () {
      var node1 = { foo: 'bar1' };
      var node2 = { foo: 'bar2' };
      instance.connect([node1, node2]);
      expect(instance.connections).to.contain(node1);
      expect(instance.connections).to.contain(node2);
    });
    it('should be chainable', function () {
      expect(instance.connect([{}, {}])).to.equal(instance);
    });
  });

  describe('disconnect()', function () {
    it('should remove all nodes from connections array', function () {
      var node1 = { foo: 'bar1' };
      var node2 = { foo: 'bar2' };
      instance.connect([node1, node2]);
      instance.disconnect();
      expect(instance.connections.length).to.equal(0);
    });
    it('should be chainable', function () {
      expect(instance.disconnect()).to.equal(instance);
    });
  });

  describe('disconnect(node)', function () {
    it('should remove specific from connections array', function () {
      var node1 = { foo: 'bar1' };
      var node2 = { foo: 'bar2' };
      instance.connect([node1, node2]);
      instance.disconnect(node1);
      expect(instance.connections.length).to.equal(1);
      expect(instance.connections).to.contain(node2);
    });
    it('should be chainable', function () {
      expect(instance.disconnect({})).to.equal(instance);
    });
  });

  describe('disconnect(chain)', function () {
    it('should remove specific nodes from connections array', function () {
      var node1 = { foo: 'bar1' };
      var node2 = { foo: 'bar2' };
      var node3 = { foo: 'bar3' };
      instance.connect([node1, node2]).connect(node3);
      instance.disconnect([node1, node2]);
      expect(instance.connections.length).to.equal(1);
      expect(instance.connections).to.contain(node3);
    });
    it('should be chainable', function () {
      expect(instance.disconnect([{}, {}])).to.equal(instance);
    });
  });
});
