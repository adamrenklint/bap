var Model = require('./Model');

var Layer = Model.extend({

  type: 'layer',

  props: {
    attack: 'number',
    release: 'number',
    length: 'number',
    duration: 'number',
    volume: 'number',
    pitch: 'number',
    pan: 'number'
  },

  runEvent: function (event, time, note, channel, slot, kit) {
    this[event](time, this.params(note, channel, this, slot, kit));
  },

  params: function () {
    var sources = [].slice.call(arguments).reverse();
    var params = {};
    var multipliers = ['volume'];
    var adders = ['pitch', 'pan'];

    Object.keys(this._definition.__proto__).forEach(function (key) {
      if (key === 'id') { return; }
      sources.forEach(function (source) {
        var value = source[key];
        if (~multipliers.indexOf(key)) {
          if (!value || value < 0) { return; }
          var multiplier = value / 100;
          params[key] = params[key] ? params[key] * multiplier : value;
        }
        else if (~adders.indexOf(key)) {
          value = value || 0;
          params[key] = params[key] ? params[key] + value : value;
        }
        else {
          params[key] = value || params[key];
        }
      });
    });

    return params;
  },

  start: function (time, params) {
    console.warn('start should be implemented by Layer subclass: ' + this.type);
  },

  stop: function (time, params) {
    console.warn('stop should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
