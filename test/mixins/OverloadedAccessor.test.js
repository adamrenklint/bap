var chai = require('chai');
var expect = chai.expect;
var Model = require('../../lib/Model');
var Collection = require('../../lib/Collection');
var OverloadedAccessor = require('../../lib/mixins/OverloadedAccessor');

OverloadedModel = Model.extend({
  collections: {
    foos: Collection
  }
}, OverloadedAccessor('foo', Model))

var instance;

beforeEach(function () {
  instance = new OverloadedModel();
});

describe('mixins/OverloadedAccessor', function () {
  describe('access(id, model)', function () {
    describe('when id is not a positive number', function () {
      describe('when model is not a Model instance', function () {
        it('should return a blank model', function () {
          var model = instance.foo();
          expect(model).to.be.instanceOf(Model);
        });
        it('should assign the blank model to the next id', function () {
          var model = instance.foo();
          expect(model.id).to.equal(1);
          var model2 = instance.foo();
          expect(model2.id).to.equal(2);
        });
      });
      describe('when model is a Model instance', function () {
        it('should assign this model to the next id', function () {
          var model = new Model();
          instance.foo();
          instance.foo(model)
          expect(model.id).to.equal(2);
        });
        it('should be chainable', function () {
          expect(instance.foo(new Model())).to.equal(instance);
        });
      });
    });
    describe('when id is a positive number', function () {
      describe('when an existing model exists on id', function () {
        describe('when model is not a Model instance', function () {
          it('should return the existing model', function () {
            var existing = instance.foo(3);
            expect(instance.foo(3)).to.equal(existing);
          });
        });
        describe('when model is a Model instance', function () {
          it('should assign this model to id', function () {
            var existing = instance.foo(3);
            var model = new Model();
            instance.foo(3, model);
            expect(model.id).to.equal(3);
          });
          it('should remove any model previously assinged to id', function () {
            var existing = instance.foo(3);
            var model = new Model();
            instance.foo(3, model);
            expect(instance.foos.length).to.equal(1);
            expect(instance.foos.get(3)).to.equal(model);
          });
          it('should be chainable', function () {
            expect(instance.foo(3, new Model())).to.equal(instance);
          });
        });
      });
      describe('when no model exists on id', function () {
        describe('when model is not a Model instance', function () {
          it('should return a blank model', function () {
            var model = instance.foo(3);
            expect(model).to.be.instanceOf(Model);
          });
          it('should assign the blank model to id', function () {
            var model = instance.foo(3);
            expect(model.id).to.equal(3);
          });
        });
        describe('when model is a Model instance', function () {
          it('should assign this model to id', function () {
            var model = new Model();
            instance.foo(3, model);
            expect(model.id).to.equal(3);
          });
          it('should be chainable', function () {
            expect(instance.foo(3, new Model())).to.equal(instance);
          });
        });
      });
    });
  });
});
