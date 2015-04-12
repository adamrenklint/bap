var Model = require('./Model');
var Slot = require('./Slot');
var Collection = require('./Collection');
var OverloadedAccessor = require('./mixins/OverloadedAccessor');

var Kit = Model.extend({

  type: 'kit',

  collections: {
    slots: Collection.extend({
      model: Slot
    })
  }

}, OverloadedAccessor('slot', Slot));

module.exports = Kit;
