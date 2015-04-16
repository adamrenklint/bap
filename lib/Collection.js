var context = require('./utils/context');
var Collection = require('ampersand-collection');

module.exports = Collection.extend({

  nextId: function () {

    var nextPossible = 0;
    var id;
    while (!id) {
      if (!this.get(++nextPossible)) {
        id = nextPossible
      }
    }

    return id;
  }
});
