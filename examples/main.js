var AudioContextMock = require('../node_modules/dilla/test/mocks/AudioContext');
var context = require('../lib/utils/context');
context.set(new AudioContextMock());
global.window = {
  requestAnimationFrame: function (cb) {
    setTimeout(cb, 1);
  }
};
var bap = require('../index');
// var metronome = require('./metronome');
var sequences = require('./sequences');
self.addEventListener('message', function(e) {
  sequences();
  self.postMessage(e.data);
}, false);
// metronome();


// var AudioContextMock = require('../node_modules/dilla/test/mocks/AudioContext');
// var context = require('../lib/utils/context');
// context.set(new AudioContextMock());
// global.window = {
//   requestAnimationFrame: function (cb) {
//     setTimeout(cb, 1);
//   }
// };
// var bap = require('../index');
// var sequences = require('./sequences');
//
// self.addEventListener('message', function(e) {
//   console.log('received');
//   sequences();
//   self.postMessage('done');
// }, false);
