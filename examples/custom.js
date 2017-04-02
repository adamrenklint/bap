var bap = require('../index');

function custom() {

  /* 
    A sample wave shape:

    This is an array of amplitude levels of your wave at equally spaced time intervals for one
    period of its cycle. To be able to use the wave shape parameter, you'll need to build a 
    different version of bap. The the comments above the bap.oscillator constructor for details.
  */
  var getSampleWaveShape = function(){
    return [264,256,241,221,212,211,229,247,263,257,244,224,213,211,228,246,263,258,248,228,214,209,224,242,260,260,248,228,214,208,222,241,259,262,251,232,215,208,218,237,254,265,256,239,219,211,214,234,252,195]
  }

  /* 
    A sample wave table:

    This data represents the real and imaginary parts of the frequency decomposition of your sound wave.
    This works off-the-bat, with no need to customize your Bap.js installation. Simply set the 
    waveTable parameter to an object consisting of two keys: "real", and "imag". Both "real" and "imag" 
    keys should point to arrays of the same length, storing the real and imaginary
    co-efficients of the constituent frequencies of your new wave shape.
  */
  var getSampleWaveTable = function(){
    return {
      real: [11755,-33.423553466796875,-40.1005973815918,-23.143386840820312,-22.181201934814453,34.37132263183594,584.684326171875,-127.62415313720703,-64.19615936279297,-55.926239013671875,-35.4123420715332,-22.02669906616211,-12.882928848266602,10.451325416564941,8.547250747680664,13.128677368164062,29.963668823242188,36.00337600708008,48.85786819458008,47.47171401977539,52.9123420715332,58.17528533935547,66.0016098022461,65.04232788085938,56.30582809448242],
      imag: [0,7.202270030975342,0.9530024528503418,12.843646049499512,31.202415466308594,39.83063888549805,-114.5093002319336,78.84117126464844,65.21057891845703,63.228515625,64.44733428955078,71.20801544189453,57.20928192138672,72.49085998535156,71.48785400390625,68.7005844116211,66.38175964355469,62.49695587158203,45.40099334716797,48.68516540527344,42.459293365478516,29.01310920715332,19.957321166992188,6.205650806427002,-13.1796236038208]
    };
  }

  var kit = bap.kit();
  
  var basic = bap.oscillator({
    attack: 0.2,
    release: 0.2,
    length: 0.4,
    shape: 'custom',
    waveShape: getSampleWaveShape(),
    // waveTable: getSampleWaveTable()
  });

  // assigning slots to kit
  kit.slot('A').layer(basic.with({ frequency: 440}));
  kit.slot('G').layer(basic.with({ frequency: 392}));
  kit.slot('F').layer(basic.with({ frequency: 349.2}));
  kit.slot('E').layer(basic.with({ frequency: 329.6}));
  kit.slot('D').layer(basic.with({ frequency: 293.6}));
  kit.slot('C').layer(basic.with({ frequency: 277.2}));

  // create the pattern and add notes using expressions
  var pattern = bap.pattern({ bars: 4, tempo: 90 });
  pattern.channel(1).add(
    ['1.1.01', '1A'],
    ['1.1.25', '1G'],
    ['1.1.49', '1A'],
    ['1.4.01', '1G'],
    ['1.4.25', '1F'],
    ['1.4.49', '1E'],
    ['1.4.73', '1D'],
    ['2.1.1', '1C'],
    ['2.2.1', '1D'],
    ['3.1.01', '1A'],
    ['3.1.25', '1G'],
    ['3.1.49', '1A'],
    ['3.3.49', '1E'],
    ['3.4.1', '1F'],
    ['3.4.49', '1C'],
    ['4.1.1', '1D']
  );

  bap.clock.sequence = pattern.kit(kit);
}

module.exports = custom;
