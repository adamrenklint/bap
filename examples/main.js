var bap = require('../index');

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.001,
    release: 0.1,
    length: 0.08
  });

  // simple way
  var pling = kit.slot(1).layer(basic.with({ 'frequency': 330 }));

  // more verbose: create, build, then assign
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ 'frequency': 440 }));
  kit.slot(2, nextSlot);

  var pattern = bap.pattern({ 'bars': 2, 'tempo': 140 });
  pattern.channel(1).add(
    ['*.1.01', 'A1'],
    ['*.2%1.01', 'A2']
  );

  pattern.use('A', kit).start();
}

function boombap () {

}

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

function navigate () {
  var hash = location.hash.substr(1);
  var example = examples[hash];
  if (example) {
    var fn = example[0];
    var description = example[1];
    exampleNameEl.textContent = hash;
    descriptionEl.textContent = description;
    sourceEl.textContent = fn.toString();
    hljs.highlightBlock(sourceEl);
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
