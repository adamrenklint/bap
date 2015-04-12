var Model = require('./Model');
var Channel = Model.extend({
  
});

module.exports = Channel;

// var Base = require('./Base');
// var inherits = require('util').inherits;
// var Note = require('./Note');
//
// function Channel (params) {
//
//   Base.call(this, params);
//
//   this._notes = [];
// }
//
// inherits(Channel, Base);
// var proto = Channel.prototype;
//
// proto.add = function () {
//   var notes = [].slice.call(arguments).map(function (raw) {
//     return Note.fromRaw(raw);
//   });
//   this._notes.push.apply(this._notes, notes);
//
//   console.log(this._notes);
// };
//
// module.exports = Channel;
