var Layer = require('./Layer');
var audioNotes = require('audio-notes');
var oscillatorParams = require('./mixins/oscillatorParams');
var dsp;

try {
  dsp = require('../node_modules/dspjs/dsp.js');
} catch(e) {
  // dsp is not installed
}

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  _source: function (params) {

    function validateAudioArray(arr){

      for (var i in arr){
        if (arr[i] < 0)
          return false;
      }

      return true;
    }

    var oscillator = this.context.createOscillator();

    var frequency = params.frequency;
    if (params.note) {
      frequency = audioNotes[params.note] || frequency;
    }
    oscillator.frequency.value = frequency || 0;

    oscillator.detune.value = params.pitch * 100;

    if (params.shape != 'custom'){
      oscillator.shape = params.shape;
    }
    else{

      var ac, wave, real, imag;

      ac = this.context;

      if (!window.bap)
          window.bap = {};

      if (params.waveTable && params.waveTable.real && params.waveTable.imag){

        real = new Float32Array(params.waveTable.real);
        imag = new Float32Array(params.waveTable.imag);

      }
      else if (params.waveShape && !!dsp){

        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function hashIntArray(array){
          var ret = 0;
          for (var i=0; i<array.length; i++){
            if (isNumeric(array[i])){
              ret += ((i+1) * array[i]);
            }
          }
          return ret;
        }

        if (!validateAudioArray(params.waveShape))
          throw new Error('Invalid waveShape array passed to oscillator');

        var hash = hashIntArray(params.waveShape);
        var real, imag;

        // creating storage, so we don't have to recalculate dfts each time
        if (!this.waveTable){
          this.waveTable = {};
        }

        // check if DFT is loaded
        if (!this.waveTable[hash]){

          var dft = new DFT(params.waveShape.length);
          dft.forward(params.waveShape);

          real = dft.real;
          imag = dft.imag;

          this.waveTable[hash] = {
            real: real,
            imag: imag,
          };
        }
        else{
          real = this.waveTable[hash].real;
          imag = this.waveTable[hash].imag;
        }
      }

      wave = ac.createPeriodicWave(real, imag);

      oscillator.setPeriodicWave(wave);
    }


    return oscillator;
  }
});

module.exports = Oscillator;
