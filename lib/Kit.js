var Model = require('./Model');
var Slot = require('./Slot');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var instanceOfType = require('./types/instanceOf');

var ids = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
var slotsProps = {};
ids.forEach(function (id) {
  slotsProps[id] = 'slot';
});
var SlotsModel = Model.extend({
  props: slotsProps,
  dataTypes: {
    slot: instanceOfType('slot', Slot)
  },
  extraProperties: 'allow'
});

var Kit = Model.extend(triggerParams, volumeParams, {

  type: 'kit',

  children: {
    slots: SlotsModel
  },

  slot: function (id, slot) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid slot identifier: ' + id);
    }
    else if (!slot) {
      slot = this.slots[id];
      if (!slot) {
        slot = new Slot();
        this.slots.set(id, slot);
      }
      return slot;
    }
    else {
      this.slots.set(id, slot);
    }
    return this;
  }
});

module.exports = Kit;
