var assert = require('../utils/assert');

function IndexedParent () {

  this.params.children = this.params.children || [];

  var proto = this.constructor.prototype;

  proto.children = function () {
    return this.params.children.slice();
  };

  proto.nextIndex = function () {
    return this.params.children.length;
  };

  proto.set = function (index, o) {
    assert.notNegativeNumber(index);
    if (o) { o.parent = this; }
    this.params.children[index] = o;
    return this;
  };

  proto.add = function (o) {
    assert.notNull(o);
    o.parent = this;
    this.params.children.push(o);
    return this;
  };
}

module.exports = IndexedParent;
