var PositionModel = require('./PositionModel');
var Dilla = require('dilla');

var Clock = PositionModel.extend({

  props: {
    playing: ['boolean', true, false]
  },

  initialize: function (options) {
    PositionModel.prototype.initialize.call(this);

    this.scheduler = new Dilla(this.context);
    this.scheduler.on('tick', this.onSchedulerTick.bind(this));
    this.scheduler.on('step', this.onSchedulerStep.bind(this));

    this.vent.on('clock:start', this.start.bind(this));
    this.on('change:playing', this.onChangePlaying.bind(this));
  },

  onChangePlaying: function () {
    var method = this.playing ? 'start' : 'pause';
    this[method]();
  },

  start: function () {
    if (!this.playing) {
      console.log('start');
      this.scheduler.start();
      this.playing = true;
    }
  },

  onSchedulerTick: function (tick) {
    this.position = tick.position;
  },

  onSchedulerStep: function (step) {

  }
});

module.exports = Clock;

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
