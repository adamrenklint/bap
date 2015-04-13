var context = require('./utils/context');
var vent = require('./utils/vent');
var State = require('ampersand-state');
var uniqueId = require('./utils/uniqueId');
var merge = require('lodash.merge');

var Model = State.extend({

  type: 'model',

  props: {
    // TODO: type uniqueInCollection
    id: ['number']
  },

  initialize: function () {
    this.context = context.get();
    this.vent = vent;
    this.cid = uniqueId(this.type);
    State.prototype.initialize.apply(this, arguments);
  },

  with: function (state) {
    state = merge({}, this.toJSON(), state);
    return new this.constructor(state);
  }
});

module.exports = Model;
