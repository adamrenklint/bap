var Base = require('./Base');
var inherits = require('util').inherits;

function Kit (options) {

  options = options || {};
  Base.call(this, options);
}

inherits(Kit, Base);

module.exports = Kit;


// slot() > create new slot, return
// slot(index) > create or return existing slot at id

// slots() > array of slots

// clear(index)
// clearAll()
