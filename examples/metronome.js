var bap = require('../index');
// var DFT = require('../dsp.js').DFT;

function getWaveShape(widthPct = 0.5, size = 101){
  var retArr = [];
  var height;

  for (var i=0;i<size;i++){
    height = 0;

    if (i < (size * widthPct)){
      height = 1;
    }

    retArr.push(height);
  }

  return retArr;
}

var waveShape = getWaveShape(0.2);
var dft = new DFT(waveShape.length);
dft.forward(waveShape);

function metronome () {
  var kit = bap.kit();
  var basic = bap.oscillator({
    attack: 0.2,
    release: 0.2,
    length: 0.4,
    shape: 'custom',
    waveShape: waveShape
  });

  // shorthand, add copy of oscillator as layer on first slot

  kit.slot('Q').layer(basic.with({ frequency: 330}));

  // more verbose: create slot, append oscillator, then assign to kit
  var nextSlot = bap.slot();
  nextSlot.layer(basic.with({ frequency: 440}));
  kit.slot('W', nextSlot);

  // create the pattern and add notes using expressions
  var pattern = bap.pattern({ bars: 2, tempo: 120 });
  pattern.channel(1).add(
    ['*.1.01',   '1Q'],
    ['*.2%1.01', '1W']
  );

  bap.clock.sequence = pattern.kit(kit);
}

module.exports = metronome;
