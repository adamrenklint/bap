var Model = require('./Model');
var Slot = require('./Slot');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');

var Kit = Model.extend(triggerParams, volumeParams, {

  type: 'kit',

  collections: {
    slots: Collection.extend({
      model: Slot
    })
  }

}, overloadedAccessor('slot', Slot));

module.exports = Kit;
