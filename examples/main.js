var bap = require('../index');
var metronome = require('./metronome');
var boombap = require('./boombap');
var slices = require('./slices');
var sequences = require('./sequences');
var effects = require('./effects');

var debounce = require('lodash.debounce');

var positionEl = document.getElementById('position');
var tempoEl = document.getElementById('tempo');
var loopedEl = document.getElementById('looped');
var toggleEl = document.getElementById('toggle-playback');

function draw () {
  positionEl.textContent = bap.clock.position;
  tempoEl.textContent = bap.clock.tempo + ' bpm';
  toggleEl.textContent = bap.clock.playing ? 'Stop playback' : 'Start playback';
  loopedEl.textContent = bap.clock.looped;
  window.requestAnimationFrame(draw);
}

toggleEl.onclick = function () {
  bap.clock.playing = !bap.clock.playing;
};

draw();

var examples = {
  'metronome': [metronome, 'A simple metronome made with <a href="http://bapjs.org">Bap</a> to test playback, and note expressions and scheduling.'],
  'boombap': [boombap, 'The boombap demo beat from <a href="https://github.com/adamrenklint/dilla">Dilla</a>, reimplemented with <a href="">Bap</a>.'],
  'slices': [slices, 'Using different parts of same sample for different layers, either by manually defining sample offset and length, or "auto-slicing" sample to a kit.\n\nAlso uses bitcrusher effect on samples.'],
  'sequences': [sequences, 'Layering patterns and sequences into longer and bigger sequences'],
  'effects': [effects, 'Effect smoke tests.']
};
var sourceEl = document.getElementById('source');
var exampleNameEl = document.getElementById('example-name');
var descriptionEl = document.getElementById('description');
var loadingStateEl = document.getElementById('loading-state');

function updateLoading () {
  loadingStateEl.style.display = bap.loadingState.loading ? 'list-item' : 'none';
}
bap.loadingState.on('change:loading', updateLoading);
updateLoading();

function unwrap (source) {
  var lines = source.split('\n');
  return lines.slice(1, lines.length - 1).map(function (line) {
    return line.substr(2);
  }).join('\n');
}

var lastEvalFn = null;

function navigate () {
  var hash = location.hash.substr(1);
  var example = examples[hash];
  if (example) {
    var fn = example[0];
    var description = example[1];
    exampleNameEl.textContent = hash;
    descriptionEl.innerHTML = description;

    lastEvalFn = fn.toString();
    sourceEl.textContent = unwrap(lastEvalFn);

    hljs.highlightBlock(sourceEl);
    bap.clock.stop();
    fn();

    [].forEach.call(document.getElementById('menu').children, function (child) {
      var active = child.children[0].href.split('#')[1] === hash;
      child.className = active ? 'active': '';
    });
  }
}
window.onhashchange = navigate;

var ids = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var pressed = {};

function onKeyDown (ev) {
  var key = String.fromCharCode(ev.keyCode);
  if (~ids.indexOf(key)) {
    pressed[key] = true;
  }
  else {
    var num = parseInt(key, 10);
    if (!isNaN(num)) {
      Object.keys(pressed).forEach(function (id) {
        bap.clock.sequence.kits.start(null, { key: id + num });
      });
    }
  }
}

function onKeyUp (ev) {
  var key = String.fromCharCode(ev.keyCode);
  if (~ids.indexOf(key)) {
    delete pressed[key];
  }
}

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function onSourceChanged () {
  if (sourceEl.textContent !== lastEvalFn) {
    lastEvalFn = sourceEl.textContent;
    eval(lastEvalFn);
  }
}
sourceEl.addEventListener('keyup', debounce(onSourceChanged, 250));

if (!location.hash) {
  location.hash = '#metronome';
}
else {
  navigate();
}
