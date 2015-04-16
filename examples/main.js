var bap = require('../index');
var metronome = require('./metronome');
var dillaBoombap = require('./dilla-boombap');
var slices = require('./slices');

var positionEl = document.getElementById('position');
var toggleEl = document.getElementById('toggle-playback');

function draw () {
  positionEl.textContent = bap.clock.position;
  toggleEl.textContent = bap.clock.playing ? 'Stop playback' : 'Start playback';
  window.requestAnimationFrame(draw);
}

toggleEl.onclick = function () {
  bap.clock.playing = !bap.clock.playing;
};

draw();

var examples = {
  'metronome': [metronome, 'A simple metronome made with <a href="">Bap</a> to test playback, and note expressions and scheduling.'],
  'dilla-boombap': [dillaBoombap, 'The boombap demo beat from <a href="">Dilla</a>, reimplemented with <a href="">Bap</a>.'],
  'slices': [slices, 'Using different parts of same sample for different layers.']
};
var sourceEl = document.getElementById('source');
var exampleNameEl = document.getElementById('example-name');
var descriptionEl = document.getElementById('description');

function unwrap (source) {
  var lines = source.split('\n');
  return lines.slice(1, lines.length - 1).map(function (line) {
    return line.substr(2);
  }).join('\n');
}

function navigate () {
  var hash = location.hash.substr(1);
  var example = examples[hash];
  if (example) {
    var fn = example[0];
    var description = example[1];
    exampleNameEl.textContent = hash;
    descriptionEl.innerHTML = description;
    sourceEl.textContent = unwrap(fn.toString());
    hljs.highlightBlock(sourceEl);
    bap.clock.position = '1.1.01';
    fn();

    [].forEach.call(document.getElementById('menu').children, function (child) {
      var active = child.children[0].href.split('#')[1] === hash;
      child.className = active ? 'active': '';
    });
  }
}
window.onhashchange = navigate;

if (!location.hash) {
  location.hash = '#metronome';
}
else {
  navigate();
}
