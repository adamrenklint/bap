var bap = require('../index');
var metronome = require('./metronome');
var boombap = require('./boombap');

var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.clock.position;
  window.requestAnimationFrame(draw);
}

draw();


var examples = {
  'metronome': [metronome, 'Just a simple metronome made with Bap to test playback, looping and note expressions.'],
  'boombap': [boombap, 'Same boombap beat as was made with Dilla']
};
var sourceEl = document.getElementById('source');
var exampleNameEl = document.getElementById('example-name');
var descriptionEl = document.getElementById('description');

function unwrap (source) {
  var lines = source.split('\n');
  return lines.slice(1, lines.length - 3).map(function (line) {
    return line.substr(1);
  }).join('\n');
}

function navigate () {
  var hash = location.hash.substr(1);
  var example = examples[hash];
  if (example) {
    var fn = example[0];
    var description = example[1];
    exampleNameEl.textContent = hash;
    descriptionEl.textContent = description;
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
