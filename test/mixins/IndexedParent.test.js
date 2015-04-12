// var chai = require('chai');
// var expect = chai.expect;
// var Base = require('../../lib/Base');
// var IndexedParent = require('../../lib/mixins/IndexedParent');
//
// var parent;
//
// beforeEach(function () {
//   parent = new Base();
//   IndexedParent.call(parent);
// });
//
// describe('lib/mixins/IndexedParent', function () {
//
//   // describe('nextIndex()', function () {
//   //   describe('when no children exists', function () {
//   //     it('should return the first index', function () {
//   //       expect(parent.nextIndex()).to.equal(0);
//   //     });
//   //   });
//   //   describe('when some children exists', function () {
//   //     it('should return the next index', function () {
//   //       parent.set(1, 'foobar');
//   //       expect(parent.nextIndex()).to.equal(2);
//   //     });
//   //   });
//   // });
//   //
//   // describe('children()', function () {
//   //   it('should return a cloned array', function () {
//   //     var children = parent.children();
//   //     children[3] = 'fooobar';
//   //     children = parent.children();
//   //     expect(children.length).to.equal(0);
//   //   });
//   //   describe('when no children exists', function () {
//   //     it('should return an empty array', function () {
//   //       var children = parent.children();
//   //       expect(children).to.be.a('array');
//   //       expect(children.length).to.equal(0);
//   //     });
//   //   });
//   //   describe('when some children exists', function () {
//   //     it('should return all children', function () {
//   //       parent.set(1, 'foobar');
//   //       var children = parent.children();
//   //       expect(children).to.be.a('array');
//   //       expect(children.length).to.equal(2);
//   //       expect(children[1]).to.equal('foobar');
//   //     });
//   //   });
//   // });
//   //
//   // describe('set(index, obj)', function () {
//   //   describe('when index is not a positive number', function () {
//   //     it('should throw an error', function () {
//   //       expect(function () {
//   //         parent.set(-1, 'foobar');
//   //       }).to.throw('Invalid argument');
//   //     });
//   //   });
//   //   describe('when index is a positive number', function () {
//   //     it('should set the obj at index', function () {
//   //       parent.set(1, 'fooooobar');
//   //       expect(parent.children()[1]).to.equal('fooooobar');
//   //       parent.set(1, null);
//   //       expect(parent.children()[1]).to.equal(null);
//   //     });
//   //     it('should set obj.parent', function () {
//   //       var foo = {};
//   //       parent.set(4, foo);
//   //       expect(foo.parent).to.equal(parent);
//   //     });
//   //     it('should be chainable', function () {
//   //       expect(parent.set(4, 'foobar')).to.equal(parent);
//   //     });
//   //   });
//   // });
//   //
//   // describe('add(obj)', function () {
//   //   describe('when obj is undefined', function () {
//   //     it('should throw an error', function () {
//   //       expect(function () {
//   //         parent.add();
//   //       }).to.throw('Invalid argument');
//   //       expect(function () {
//   //         parent.add(null);
//   //       }).to.throw('Invalid argument');
//   //     });
//   //   });
//   //   describe('when obj is defined', function () {
//   //     it('should add it to children', function () {
//   //       parent.add('foobar');
//   //       parent.add('foobar2');
//   //       expect(parent.children().length).to.equal(2);
//   //     });
//   //     it('should set obj.parent', function () {
//   //       var foo = {};
//   //       parent.add(foo);
//   //       expect(foo.parent).to.equal(parent);
//   //     });
//   //     it('should be chainable', function () {
//   //       expect(parent.add({})).to.equal(parent);
//   //     });
//   //   });
//   // });
// });
