var Base = require('./Base');
var inherits = require('util').inherits;

var Slot = require('./Slot');

function Kit (options) {

  options = options || {};
  Base.call(this, options);
  
}

inherits(Kit, Base);

Kit.prototype.slot = function (index) {
  // if (!index) return new Slot({});
  // create new slot
  // var
};

module.exports = Kit;


// slot() > create new slot, return
// slot(index) > create or return existing slot at id

// slots() > array of slots

// clear(index)
// clearAll()
