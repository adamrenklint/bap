const context = require('./utils/context');
const Collection = require('ampersand-collection');

module.exports = Collection.extend({

  nextId: function () {

    let nextPossible = 0;
    let id;
    while (!id) {
      if (!this.get(++nextPossible)) {
        id = nextPossible;
      }
    }

    return id;
  }
});
