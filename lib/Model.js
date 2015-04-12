var context = require('./utils/context');
var vent = require('./utils/vent');
var State = require('ampersand-state');

var Model = State.extend({

  props: {
    id: ['number']
  },

  initialize: function () {
    this.context = context.get();
    this.vent = vent;
    State.prototype.initialize.apply(this, arguments);
  }
});

module.exports = Model;
