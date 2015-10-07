var bap = require('../index');

function effects () {

  var baseSample = bap.sample({
    src: 'sounds/plong1.wav',
    duration: 96,
    volume: 80,
    release: 0.05
  });

  // reverb

  var reverbKit = bap.kit();
  var smallReverb = bap.reverb({ time: 0.5 });
  reverbKit.slot('Q').layer(baseSample.with()).connect(smallReverb);
  var mediumReverb = bap.reverb({ time: 1 });
  reverbKit.slot('W').layer(baseSample.with()).connect(mediumReverb);
  var bigReverb = bap.reverb({ time: 2 });
  reverbKit.slot('E').layer(baseSample.with()).connect(bigReverb);
  var hugeReverb = bap.reverb({ time: 4 });
  reverbKit.slot('R').layer(baseSample.with()).connect(hugeReverb);

  var reverbPattern = bap.pattern({ bars: 2 }).kit(1, reverbKit);
  reverbPattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.3.01', '1R']
  );

  // delay

  var delayKit = bap.kit();
  var smallDelay = bap.delay({ sync: true, time: 0.25, feedback: 75 });
  delayKit.slot('Q').layer(baseSample.with()).connect(smallDelay);
  var mediumDelay = bap.delay({ sync: true, time: 0.5, feedback: 50 });
  delayKit.slot('W').layer(baseSample.with()).connect(mediumDelay);
  var bigDelay = bap.delay({ sync: true, time: 0.75, feedback: 25 });
  delayKit.slot('E').layer(baseSample.with()).connect(bigDelay);

  var delayPattern = bap.pattern({ bars: 2 }).kit(1, delayKit);
  delayPattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E']
  );

  // overdrive

  var overdriveKit = bap.kit();
  var smallOverdrive = bap.overdrive({ wet: 20, color: 3000, postCut: 3000 });
  overdriveKit.slot('Q').layer(baseSample.with()).connect(smallOverdrive);
  var mediumOverdrive = bap.overdrive({ wet: 50, color: 2000, postCut: 2000 });
  overdriveKit.slot('W').layer(baseSample.with()).connect(mediumOverdrive);
  var bigOverdrive = bap.overdrive({ wet: 75, color: 1000, postCut: 1000 });
  overdriveKit.slot('E').layer(baseSample.with()).connect(bigOverdrive);
  var hugeOverdrive = bap.overdrive({ wet: 100, color: 500, postCut: 500 });
  overdriveKit.slot('R').layer(baseSample.with()).connect(hugeOverdrive);

  var overdrivePattern = bap.pattern({ bars: 2 }).kit(1, overdriveKit);
  overdrivePattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.3.01', '1R']
  );

  // compressor

  var compressorKit = bap.kit();
  var smallCompressor = bap.compressor({ threshold: -10, ratio: 10 });
  compressorKit.slot('Q').layer(baseSample.with()).connect(smallCompressor);
  var mediumCompressor = bap.compressor({ threshold: -20, ratio: 10 });
  compressorKit.slot('W').layer(baseSample.with()).connect(mediumCompressor);
  var bigCompressor = bap.compressor({ threshold: -30, ratio: 10 });
  compressorKit.slot('E').layer(baseSample.with()).connect(bigCompressor);
  var hugeCompressor = bap.compressor({ threshold: -40, ratio: 10 });
  compressorKit.slot('R').layer(baseSample.with()).connect(hugeCompressor);

  var compressorPattern = bap.pattern({ bars: 2 }).kit(1, compressorKit);
  compressorPattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.3.01', '1R']
  );

  // filter

  var filterKit = bap.kit();
  var lowpassFilter = bap.filter({ shape: 'lowpass', frequency: 500 });
  filterKit.slot('Q').layer(baseSample.with()).connect(lowpassFilter);
  var highpassFilter = bap.filter({ shape: 'highpass', frequency: 2000 });
  filterKit.slot('W').layer(baseSample.with()).connect(highpassFilter);
  var peakingFilter = bap.filter({ shape: 'peaking', frequency: 600, value: 200, gain: 50 });
  filterKit.slot('E').layer(baseSample.with()).connect(peakingFilter);
  var highshelfFilter = bap.filter({ shape: 'lowshelf', frequency: 150, value: -300 });
  filterKit.slot('R').layer(baseSample.with()).connect(highshelfFilter);

  var filterPattern = bap.pattern({ bars: 2 }).kit(1, filterKit);
  filterPattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.3.01', '1R']
  );

  // chorus

  var chorusKit = bap.kit();
  var defaultChorus = bap.chorus();
  chorusKit.slot('Q').layer(baseSample.with()).connect(defaultChorus);
  var secondChorus = bap.chorus({ rate: 5 });
  chorusKit.slot('W').layer(baseSample.with()).connect(secondChorus);
  var thirdChorus = bap.chorus({ feedback: 0.8 });
  chorusKit.slot('E').layer(baseSample.with()).connect(thirdChorus);
  var fourthChorus = bap.chorus({ rate: 10, delay: 0.01, feedback: 0.6 });
  chorusKit.slot('R').layer(baseSample.with()).connect(fourthChorus);

  var chorusPattern = bap.pattern({ bars: 2 }).kit(1, chorusKit);
  chorusPattern.channel().add(
    ['1.1.01', '1Q'],
    ['1.3.01', '1W'],
    ['2.1.01', '1E'],
    ['2.3.01', '1R']
  );

  bap.clock.sequence = bap.sequence(
    reverbPattern,
    delayPattern,
    filterPattern,
    compressorPattern,
    overdrivePattern,
    chorusPattern,
    { loop: true }
  );
}

module.exports = effects;
