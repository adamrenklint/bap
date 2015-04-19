var context = require('./utils/context');
var vent = require('./utils/vent');
var State = require('ampersand-state');
var uniqueId = require('./utils/uniqueId');
var merge = require('lodash.merge');
var changeRE = /^change:/;

var Model = State.extend({

  type: 'model',

  props: {
    id: ['number']
  },

  // extraProperties: 'reject',

  initialize: function () {
    this.context = context.get();
    this.vent = vent;
    this.cid = uniqueId(this.type);
    State.prototype.initialize.apply(this, arguments);
  },

  with: function (state) {
    state = merge({}, this.toJSON(), state);
    return new this.constructor(state);
  },

  _initCollections: function () {
    State.prototype._initCollections.call(this);
    for (var coll in this._collections) {
      this.listenTo(this[coll], 'all', this._getCollectionEventBubblingHandler(coll));
    }
  },

  _getCollectionEventBubblingHandler: function (propertyName) {
    return function (eventName, model, newValue, collection) {
      var validNames = ['change', 'add', 'remove'];
      if (~validNames.indexOf(eventName)) {
        this.trigger('change:' + propertyName, model, newValue);
        this.trigger(eventName, this);
      }
      else {
        var next;
        while (next = validNames.shift()) {
          if (~eventName.indexOf(next + ':')) {
            var parts = eventName.split(':');
            var type = parts[0];
            var callers = [propertyName].concat(parts[1].split('.'));
            while (callers.length) {
              this.trigger(type + ':' + callers.join('.'), model, newValue);
              callers.pop();
            }
            this.trigger(type, model, newValue);
          }
        }
      }
    }.bind(this);
  }
});

module.exports = Model;
