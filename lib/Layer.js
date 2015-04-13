var Model = require('./Model');

var Layer = Model.extend({

  type: 'layer',

  props: {
    attack: 'number',
    release: 'number',
    length: 'number',
    duration: 'number'
  },

  start: function (time, note, channel) {

    console.warn('start should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
