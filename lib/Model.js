const context = require('./utils/context');
const vent = require('./utils/vent');
const State = require('ampersand-state');
const uniqueId = require('./utils/uniqueId');
const merge = require('lodash.merge');
const memoize = require('meemo');
const changeRE = /^change:/;

function hashArgs () {
  const args = new Array(arguments.length);
  for (let i = 0, l = arguments.length; i < l; i++) {
    args[i] = arguments[i];
  }
  return args.join('//');
}

const Model = State.extend({

  type: 'model',

  props: {
    id: ['number']
  },

  extraProperties: 'reject',

  initialize: function (params, options) {
    this.context = context.get();
    this.vent = vent.get();
    this.cid = uniqueId(this.type);
    State.prototype.initialize.apply(this, arguments);
    if (params) {
      this.set(params, merge({
        silent: true,
        initial: true
      }, options));
    }
  },

  with: function (state) {
    state = merge({}, this.toJSON(), state);
    return new this.constructor(state);
  },

  cacheMethodUntilEvent: function (name, event) {
    const originalMethod = this[name].bind(this);
    const reset = () => {
      this[name] = memoize(originalMethod, hashArgs);
      return reset;
    };
    this.on(event, reset);
    return reset();
  },

  destroy: function () {
    this.off();
    this.stopListening();
  },

  _initCollections: function () {
    State.prototype._initCollections.call(this);
    for (const coll in this._collections) {
      this.listenTo(this[coll], 'all', this._getCollectionEventBubblingHandler(coll));
    }
  },

  _getCollectionEventBubblingHandler: function (propertyName) {
    return (eventName, model, newValue, collection) => {
      const validNames = ['change', 'add', 'remove'];
      if (~validNames.indexOf(eventName)) {
        this.trigger(`change:${propertyName}`, model, newValue);
        this.trigger(eventName, this);
      }
      else {
        let next;
        while (validNames.length) {
          next = validNames.shift();
          if (~eventName.indexOf(`${next}:`)) {
            const parts = eventName.split(':');
            const type = parts[0];
            const callers = [propertyName].concat(parts[1].split('.'));
            while (callers.length) {
              this.trigger(`${type}:${callers.join('.')}`, model, newValue);
              callers.pop();
            }
            this.trigger(type, model, newValue);
          }
        }
      }
    };
  }
});

module.exports = Model;
