// // Clock wraps Dilla and keeps each playing pattern or sequence in a "channel"
// // When about to switch over to another sequence, handles transition of events routing
// // Also when sequence ends, no more notes, makes channel is ended
//
//
// // notes are only set when is about to start, or is running
//
//
//
// var Base = require('./Base');
// var inherits = require('util').inherits;
// var Dilla = require('dilla');
//
// function Clock (params) {
//
//   Base.call(this, params);
//
//   this.scheduler = new Dilla(this.params.context);
//   this.scheduler.on('tick', this.onSchedulerTick.bind(this));
//   this.scheduler.on('step', this.onSchedulerStep.bind(this));
// }
//
// inherits(Clock, Base);
// var proto = Clock.prototype;
//
// proto.onSchedulerTick = function (tick) {
//   // console.log('TICK', tick)
// };
//
// proto.onSchedulerStep = function (step) {
//   console.log('STEP', step);
// };
//
// proto.start = function (pattern) {
//
//   this.scheduler.setLoopLength(pattern.params.bars);
//   this.scheduler.setBeatsPerBar(pattern.params.beatsPerBar);
//   this.scheduler.setTempo(pattern.params.tempo);
//
//   console.log(pattern)
//   // this.scheduler.set('current', pattern.notes.map(function (note) {
//   //
//   // }));
//
//   this.scheduler.start();
// };
//
// proto.pause = function () {
//   this.scheduler.pause();
// };
//
// proto.stop = function () {
//   this.scheduler.stop();
// };
//
// module.exports = Clock;
