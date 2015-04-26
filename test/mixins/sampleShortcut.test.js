var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var Model = require('../../lib/Model');
var Collection = require('../../lib/Collection');
var sampleShortcut = require('../../lib/mixins/sampleShortcut');

describe('mixins/sampleShortcut', function () {
  describe('_initSampleShortcut()', function () {
    it('should rename layer() to _originalLayerFunction()', function () {
      var original = function () {};
      var Foo = Model.extend({
        initialize: function () {
          Model.prototype.initialize.apply(this, arguments);
          this._initSampleShortcut();
        },
        layer: original
      }, sampleShortcut);
      var foo = new Foo();
      expect(foo._originalLayerFunction).to.equal(original);
    });
    it('should rename _overloadedLayerFn() to layer()', function () {
      var Foo = Model.extend({
        initialize: function () {
          Model.prototype.initialize.apply(this, arguments);
          this._initSampleShortcut();
        },
        layer: function () {}
      }, sampleShortcut);
      var foo = new Foo();
      expect(foo.layer).to.equal(sampleShortcut._overloadedLayerFn);
    });
  });
  describe('_overloadedLayerFn(src, params)', function () {
    describe('when src is a string', function () {
      it('should return an instance of Sample (_sampleConstructor)', function () {
        var spy = sinon.spy();
        var foo = {
          layers: new Collection,
          _sampleConstructor: spy,
          layer: sampleShortcut._overloadedLayerFn
        };
        foo.layer('foo/bar', { reverse: false });
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWithNew;
        expect(spy).to.have.been.calledWith({
          src: 'foo/bar',
          reverse: false
        });
      });
      it('should add the sample as a layer', function () {
        var ctor = function () {
          this.foo = 'bar';
        };
        var foo = {
          layers: new Collection,
          _sampleConstructor: ctor,
          layer: sampleShortcut._overloadedLayerFn
        };
        sinon.spy(foo.layers, 'add');
        var result = foo.layer('foo/bar');
        expect(result.foo).to.equal('bar');
        expect(foo.layers.add).to.have.been.calledOnce;
        expect(foo.layers.length).to.equal(1);
      });
    });
    describe('when src is a params object', function () {
      it('should just pass it on to _originalLayerFunction()', function () {
        var spy = sinon.spy();
        var foo = {
          _originalLayerFunction: spy,
          layer: sampleShortcut._overloadedLayerFn
        };
        foo.layer({ src: 'foo/bar', reverse: true });
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWith({
          src: 'foo/bar',
          reverse: true
        });
      });
    });
  });
});
