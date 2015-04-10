var bap = require('../../index');

var drumkit = bap.kit();
drumkit.slot(1).layer('sounds/kick.wav');
drumkit.slot(2).layer(bap.sample('sounds/snare.wav'));
drumkit.slot(3).layer(bap.sample({
  'src': 'sounds/hihat.wav'
}));

var drumPattern = bap.pattern(1);
drumPattern/*.channel()*/.add(
  ['1.1.01', 'A01'],
  ['1.1.51', 'A01', null, 80],
  ['1.1.91', 'A02'],
  ['1.2.88', 'A01'],
  ['1.3.75', 'A01'],
  ['1.3.91', 'A02'],
  ['1.4.72', 'A01', null, 80],
  ['2.1.91', 'A02'],
  ['2.1.51', 'A01', null, 70],
  ['2.3.51', 'A01', null, 80],
  ['2.3.88', 'A01'],
  ['2.4.03', 'A02']
);
// var onlySnares = drumPattern.channel(1).filter(-> return note.key === 'A2')
// var otherKey = drumPattern.transform(note -> note.key == note.key.replace(A, B); return note; )
drumPattern.channel().add(
  ['*.1.01', 'A03', null, 70],
  ['*.2.01', 'A03', null, 80],
  ['*.3.01', 'A03', null, 70],
  ['*.4.01', 'A03', null, 80],
  ['*.4.53', 'A03', null, 60]
);

var sequence = bap.sequence(drumPattern, drumPattern); // pointless, but should double the bar length
sequence.use('A', drumKit).loop().start();
// pattern.use('A', kit).start();

var positionEl = document.getElementById('position');
function draw () {
  positionEl.textContent = bap.position;
  window.requestAnimationFrame(draw);
}

draw();
