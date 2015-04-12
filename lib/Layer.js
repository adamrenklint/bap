var Model = require('./Model');

var Layer = Model.extend({

  type: 'layer',

  props: {
    attack: 'number',
    release: 'number',
    length: 'number',
    duration: 'number'
  },

  triggerAt: function (time, note) {

    console.warn('triggerAt should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
