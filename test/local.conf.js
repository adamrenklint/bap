module.exports = function (config) {

  config.set({

    basePath: '../',
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/**/*.test.js'
    ],
    preprocessors: {
      'test/**/*.js': [ 'browserify' ]
    },
    browserify: {
      debug: true,
      transform: [ 'brfs' ]
    },
    reportSlowerThan: 10,
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox', 'Chrome', 'Safari'],
    singleRun: false
  });
};
