var bap = require('../index');

function sequences () {

  var sampleKit = bap.kit();
  var base = bap.sample({
    src: 'sounds/slices.wav',
    attack: 0.01,
    release: 0.01,
    channel: 'right'
  });
  sampleKit.slot(1).layer(base.with({
    offset: 0.072,
    length: 0.719
  }));
  sampleKit.slot(2).layer(base.with({
    offset: 0.9,
    length: 0.750
  }));
  sampleKit.slot(3).layer(base.with({
    offset: 1.68,
    length: 0.690
  }));
  sampleKit.slot(4).layer(base.with({
    offset: 9.49,
    length: 2,
    reverse: true
  }));

  var breakKit = bap.sample({
    src: 'sounds/esther.wav',
    pitch: -26
  }).slice(16);
  breakKit.slot(1).layer('sounds/kick.wav');
  breakKit.slot(2).layer('sounds/snare.wav');
  breakKit.slot(4).layer('sounds/snare.wav');

  var introSamplePattern = bap.pattern({ bars: 2, tempo: 200 });
  introSamplePattern.channel(1).add(
    ['1.1.01', 'A1', 96],
    ['1.2.01', 'A1', 96],
    ['1.3.01', 'A1', 96],
    ['1.4.01', 'A1', 96],
    ['1.4.01', 'A2'],
    ['2.1.01', 'A2'],
    ['2.2.01', 'A3'],
    ['2.3.01', 'A3'],
    ['2.4.01', 'A3']
  );

  var mainSamplePattern = bap.pattern({ beatsPerBar: 3, bars: 2, tempo: 95 });
  mainSamplePattern.channel(1).add(
    ['1.1.01', 'A1', 96],
    ['1.2.01', 'A1', 96],
    ['1.3.01', 'A2'],
    ['2.1.01', 'A3'],
    ['2.2.80', 'A4', (96 * 2) + 16 ]
  );

  var drumPattern = bap.pattern({ bars: 2, tempo: 95 });
  drumPattern.channel(2).add(
    ['1.1.01', 'B1'],
    ['1.2.01', 'B2'],
    ['1.3.01', 'B3'],
    ['1.4.01', 'B4'],
    ['2.1.01', 'B1'],
    ['2.2.01', 'B2'],
    ['2.3.01', 'B8'],
    ['2.4.01', 'B9'],
    ['2.4.49', 'B5', 48]
  );

  mainSamplePattern.kit('A', sampleKit);
  introSamplePattern.kit('A', sampleKit);
  drumPattern.kit('B', breakKit);

  var sequence = bap.sequence([
    // [mainSamplePattern, drumPattern],
    // [mainSamplePattern, drumPattern],
    [mainSamplePattern, drumPattern]
  ]);

  // var sequence2 = bap.sequence([
  //   introSamplePattern,
  //   sequence,
  //   sequence,
  //   sequence
  // ]);
  // var on = false;
  // function next() {
  //   if (on) {
  //     drumPattern.start();
  //   }
  //   else {
  //     sequence.start();
  //   }
  //   on = !on;
  //   setTimeout(next, 3000);
  // }
  // next();
  // var p = bap.pattern()
  // p.channel(1).add(
  //   ['*.*.*', 'C1']
  // );
  // p.start();
  var s = bap.sequence([
    introSamplePattern,
    sequence
  ], {loop:true});
  s.start();

  setTimeout(function () {
    s.pause();
    bap.clock.position = '3.1.01';
    setTimeout(function () {
      console.log('tempo should be correct here, 95');
      s.start();
    }, 1000);
  }, 1000);
}

module.exports = sequences;
