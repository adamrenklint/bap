var context = require('./utils/context');
var State = require('ampersand-state');

var Model = State.extend({

  props: {
    id: ['number']
  },

  initialize: function () {
    this.context = context.get();
    State.prototype.initialize.apply(this, arguments);
  }
});

module.exports = Model;
