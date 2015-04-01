var damu = require('../index');
var dilla = require('dilla')(require('audio-context'));

// import the kits
var drums = require('./drums');
var plongs = require('./plongs');
var strings = require('./strings');

// setup the pattern
require('./pattern')(dilla);

// plugin the kits
damu.use('A', drums);
damu.use('B', plongs);
damu.use('C', strings);

// set it off
dilla.setTempo(88);
damu.load(function (err) {
  if (err) throw err;
  dilla.start();
});
