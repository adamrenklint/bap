var Model = require('./Model');
var Slot = require('./Slot');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');

var Kit = Model.extend({

  type: 'kit',

  collections: {
    slots: Collection.extend({
      model: Slot
    })
  }

}, overloadedAccessor('slot', Slot));

module.exports = Kit;
