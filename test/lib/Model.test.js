var chai = require('chai');
var expect = chai.expect;
var Model = require('../../lib/Model');

var model;

beforeEach(function () {
  model = new Model();
});

describe('Model', function () {

  describe('with(state)', function () {

    var Foo = Model.extend({
      props: {
        foo: 'string',
        bar: 'string'
      }
    });

    describe('when state is null', function () {
      it('should return a clone', function () {
        var foo = new Foo({ foo: 'baz', bar: 'bil' });
        var clone = foo.with();
        expect(clone).to.be.instanceOf(Foo);
        expect(clone.foo).to.equal('baz');
        expect(clone.bar).to.equal('bil');
        expect(clone).not.to.equal(foo);
      });
    });
    describe('when state is a set of values', function () {
      it('should return a clone with overridden values', function () {
        var foo = new Foo({ foo: 'baz', bar: 'bil' });
        var clone = foo.with({ bar: 'booze' });
        expect(clone).to.be.instanceOf(Foo);
        expect(clone.foo).to.equal('baz');
        expect(clone.bar).to.equal('booze');
        expect(clone).not.to.equal(foo);
      });
    });
  });

  describe('cacheMethodUntilEvent(name, event)', function () {
    var Memoized = Model.extend({
      initialize: function () {
        Model.prototype.initialize.apply(this, arguments);
        this.fooValues = [];
        this.resetDoFoo = this.cacheMethodUntilEvent('doFoo', 'foo:bar');
      },
      doFoo: function (one, two, three) {
        this.fooValues.push.apply(this.fooValues, arguments);
      }
    });
    var memoized;
    beforeEach(function () {
      memoized = new Memoized();
    });
    it('should memoize the function', function () {
      memoized.doFoo('a');
      memoized.doFoo('b');
      memoized.doFoo('a');
      expect(memoized.fooValues.length).to.equal(2);
      expect(memoized.fooValues.join('-')).to.equal('a-b');
    });
    it('should reset the memoization when event is called', function () {
      memoized.doFoo('a');
      memoized.doFoo('b');
      memoized.trigger('foo:bar');
      memoized.doFoo('a');
      expect(memoized.fooValues.length).to.equal(3);
      expect(memoized.fooValues.join('-')).to.equal('a-b-a');
    });
    it('should return a "reset" function', function () {
      memoized.doFoo('a');
      memoized.doFoo('b');
      memoized.resetDoFoo();
      memoized.doFoo('a');
      expect(memoized.fooValues.length).to.equal(3);
      expect(memoized.fooValues.join('-')).to.equal('a-b-a');
    });
    it('should serialize all arguments as hash key', function () {
      memoized.doFoo('a', 'b', 'c');
      memoized.doFoo('b');
      memoized.doFoo('a', 'b', 'c');
      expect(memoized.fooValues.length).to.equal(4);
      expect(memoized.fooValues.join('-')).to.equal('a-b-c-b');
    });
  });
});
