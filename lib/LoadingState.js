var Model = require('./Model');

var LoadingState = Model.extend({

  type: 'loadingState',

  props: {
    sources: ['array', true, function () { return []; }]
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
    this.trigger('change:sources');
  },

  addSource: function (src) {
    if (this.sources.indexOf(src) < 0) {
      this.sources.push(src);
      this.trigger('change:sources');
    }
  },

  removeSource: function (src) {
    var index = this.sources.indexOf(src);
    if (index > -1) {
      this.sources.splice(index, 1);
      this.trigger('change:sources');
    }
  }
});

module.exports = LoadingState;
