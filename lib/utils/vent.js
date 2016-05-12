var State = require('ampersand-state');
var vent = null

function reset () {
  vent = new (State.extend())();
}

module.exports = {
  reset: reset,
  get: function () {
    if (!vent) reset();
    return vent;
  }
};
