// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015


// Date.now() is supported everywhere except IE8. For IE8 we use the Date.now polyfill
//   github.com/Financial-Times/polyfill-service/blob/master/polyfills/Date.now/polyfill.js
// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values

// if you want values similar to what you'd get with real perf.now, place this towards the head of the page
// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed


(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }

  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();


var bap = require('../index');
var metronome = require('./metronome');
var boombap = require('./boombap');
var slices = require('./slices');
var sequences = require('./sequences');

var debounce = require('lodash.debounce');

var positionEl = document.getElementById('position');
var tempoEl = document.getElementById('tempo');
var toggleEl = document.getElementById('toggle-playback');

function draw () {
  positionEl.textContent = bap.clock.position;
  tempoEl.textContent = bap.clock.tempo + ' bpm';
  toggleEl.textContent = bap.clock.playing ? 'Stop playback' : 'Start playback';
  window.requestAnimationFrame(draw);
}

toggleEl.onclick = function () {
  bap.clock.playing = !bap.clock.playing;
};

draw();

var examples = {
  'metronome': [metronome, 'A simple metronome made with <a href="http://bapjs.org">Bap</a> to test playback, and note expressions and scheduling.'],
  'boombap': [boombap, 'The boombap demo beat from <a href="https://github.com/adamrenklint/dilla">Dilla</a>, reimplemented with <a href="">Bap</a>.'],
  'slices': [slices, 'Using different parts of same sample for different layers, either by manually defining sample offset and length, or "auto-slicing" sample to a kit.'],
  'sequences': [sequences, 'Layering patterns and sequences into longer and bigger sequences']
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
    // bap.clock.pause();

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

var inited = false;
document.body.addEventListener('touchstart', function () {
  if (!inited) {
    inited = true;
    alert('inited');

    var source = bap.clock.context.createBufferSource();
    source.buffer = bap.clock.context.createBuffer(1, 22050, 44100);
    source.start(0);

    // play empty sound buffer

    // bap.clock.sequence.kits.models[0].slot('Q').start();
    // setTimeout(function () {
    //   bap.clock.sequence.kits.models[0].slot('Q').stop();
    //   // setTimeout(function () {
    //   //   bap.clock.start();
    //   // }, 1000);
    // }, 1000);
  }
});
