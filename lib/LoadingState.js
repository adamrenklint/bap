const Model = require('./Model');

const LoadingState = Model.extend({

  type: 'loadingState',

  props: {
    sources: ['array', true, () => []]
  },

  derived: {
    loading: {
      deps: ['sources'],
      fn: function () {
        return !!this.sources.length;
      }
    }
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.listenTo(this.vent, 'loadingState:add', this._addSource);
    this.listenTo(this.vent, 'loadingState:remove', this._removeSource);
    this.trigger('change:sources');
  },

  _addSource: function (src) {
    if (!this.sources.includes(src)) {
      this.sources.push(src);
      this.trigger('change:sources');
    }
  },

  _removeSource: function (src) {
    const index = this.sources.indexOf(src);
    if (index > -1) {
      this.sources.splice(index, 1);
      this.trigger('change:sources');
    }
  }
});

module.exports = LoadingState;
