let audioContext = require('audio-context');

module.exports = {
  set: function (newContext) {
    audioContext = newContext;
  },

  get: function () {
    return audioContext;
  }
};
