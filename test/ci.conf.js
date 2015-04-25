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
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Firefox'],
    singleRun: true
  });
};
