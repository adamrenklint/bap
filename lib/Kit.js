const Model = require('./Model');
const Slot = require('./Slot');
const Collection = require('./Collection');
const overloadedAccessor = require('./mixins/overloadedAccessor');
const triggerParams = require('./mixins/triggerParams');
const volumeParams = require('./mixins/volumeParams');
const connectable = require('./mixins/connectable');
const bypassable = require('./mixins/bypassable');
const instanceOfType = require('./types/instanceOf');

const ids = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
const slotsProps = {};
ids.forEach(id => {
  slotsProps[id] = 'slot';
});
const SlotsModel = Model.extend({
  props: slotsProps,
  dataTypes: {
    slot: instanceOfType('slot', Slot)
  },
  extraProperties: 'allow'
});

const Kit = Model.extend(triggerParams, volumeParams, connectable, bypassable, {

  type: 'kit',

  children: {
    slots: SlotsModel
  },

  slot: function (id, slot) {
    if (!id || typeof id !== 'string') {
      throw new Error(`Invalid slot identifier: ${id}`);
    }
    else if (!slot) {
      slot = this.slots[id];
      if (!slot) {
        slot = new Slot();
        this.slots.set(id, slot);
        slot.kit = this;
      }
      return slot;
    }
    else {
      this.slots.set(id, slot);
      slot.kit = this;
    }
    return this;
  }
});

module.exports = Kit;
