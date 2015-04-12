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
});
