var audioContext = require('audio-context');

module.exports = {
  set: function (newContext) {
    if (newContext) {
      audioContext = newContext;
    }
  },

  get: function () {
    return audioContext;
  }
};
