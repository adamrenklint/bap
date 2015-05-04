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
    reportSlowerThan: 50,
    reporters: ['mocha', 'osx'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // browsers: ['Chrome'],
    browsers: ['Firefox', 'Chrome', 'Safari'],
    singleRun: false
  });
};
