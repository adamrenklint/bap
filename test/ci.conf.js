var local = require('./local.conf');

module.exports = function (config) {

  local(config);

  config.set({
    autoWatch: false,
    browsers: ['Firefox'],
    singleRun: true
  });
};
