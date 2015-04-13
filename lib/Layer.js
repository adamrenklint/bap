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
    console.log(event, note)
    this[event](time, this.params(note, channel, this, slot, kit));
  },

  params: function () {
    var sources = [].slice.call(arguments).reverse();
    var params = {};
    var modifiers = ['volume', 'pitch', 'pan'];
    var negativeModifiers = ['pitch', 'pan'];

    Object.keys(this._definition.__proto__).forEach(function (key) {
      if (key === 'id') { return; }
      // console.log(key)
      sources.forEach(function (source) {
        if (~modifiers.indexOf(key)) {
          if (!source[key]) { return; }
          var value = source[key];
          if (~negativeModifiers.indexOf(key)) {
            // value += 100;
          }
          else if (value < 0) {
            return;
          }
          var modifier = value / 100;
          params[key] = params[key] ? params[key] * modifier : value;
        }
        else {
          params[key] = source[key] || params[key];
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
