// Karma configuration
// Generated on Sat Apr 11 2015 17:43:21 GMT+0200 (CEST)

module.exports = function(config) {

  var customLaunchers = {
    sl_win_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 8.1',
      version: '41'
    }
    // ,
    // sl_win_firefox: {
    //   base: 'SauceLabs',
    //   browserName: 'firefox',
    //   platform: 'Windows 7',
    //   version: '37'
    // },
    // sl_win_ie: {
    //   base: 'SauceLabs',
    //   browserName: 'internet explorer',
    //   platform: 'Windows 8.1',
    //   version: '11.0'
    // }
    // sl_osx_chrome: {
    //   base: 'SauceLabs',
    //   browserName: 'chrome',
    //   platform: 'OS X 10.10',
    //   version: '41'
    // }
    // sl_firefox: {
    //   base: 'SauceLabs',
    //   browserName: 'firefox',
    //   version: '37'
    // }

    // sl_osx_safari: {
    //   base: 'SauceLabs',
    //   browserName: 'iphone',
    //   platform: 'OS X 10.10',
    //   version: '8.2'
    // }

    // sl_ios_safari: {
    //   base: 'SauceLabs',
    //   browserName: 'iphone',
    //   platform: 'OS X 10.9',
    //   version: '8.2'
    // },
    // sl_ie_11: {
    //   base: 'SauceLabs',
    //   browserName: 'internet explorer',
    //   platform: 'Windows 8.1',
    //   version: '11'
    // }
  };

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    testName: 'bap tests',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],


    // list of files / patterns to load in the browser
    files: [
      'test/**/*.test.js'
    ],


    // list of files to exclude
    // exclude: [
    // ],

    customLaunchers: customLaunchers,


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': [ 'browserify' ]
    },

    browserify: {
      debug: true,
      transform: [ 'brfs' ]
    },

    reportSlowerThan: 10,


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['saucelabs'],
    reporters: ['dots', 'saucelabs'],
    // reporters: ['dots'],

    browserNoActivityTimeout: 60,

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome', 'Safari', 'Firefox'],
    // browsers: ['Firefox'],
    browsers: Object.keys(customLaunchers),


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
    // singleRun: false
  });
};
