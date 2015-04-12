var context = require('./utils/context');
var State = require('ampersand-state');

var Base = State.extend({

  initialize: function (state, options) {
    this.context = options && options.context || context.get();
    State.prototype.initialize.apply(this, arguments);
  }
});

module.exports = Base;
