var Layer = require('./Layer');
var audioNotes = require('audio-notes');
var oscillatorParams = require('./mixins/oscillatorParams');
var memoize = require('meemo');
var fft = require('fft-js').fft;

var Oscillator = Layer.extend(oscillatorParams, {

  type: 'oscillator',

  _source: function (params) {

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

      if (params.waveTable && params.waveTable.real && params.waveTable.imag){
        real = new Float32Array(params.waveTable.real);
        imag = new Float32Array(params.waveTable.imag);
      }
      else if (params.waveShape){

        if (!Oscillator.validateAudioArray(params.waveShape))
          throw new Error('Invalid waveShape array passed to oscillator');

        var hash = Oscillator.hashIntArray(params.waveShape);
        var real, imag;

        // creating storage, so we don't have to recalculate dfts each time
        if (!this.waveTable){
          this.waveTable = {};
        }

        if (!this.waveTable[hash]){

          var waveShape = Oscillator.powerOfTwoStretch(params.waveShape);
          var wavePhasors = fft(waveShape);

          var partialsCount = wavePhasors.length;
          var real = new Float32Array(partialsCount);
          var imag = new Float32Array(partialsCount);

          for (var i=0; i<partialsCount; i++){
            real[i] = wavePhasors[i][0];
            imag[i] = wavePhasors[i][1];
          }

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

Oscillator.validateAudioArray = memoize(function(arr){

  for (var i in arr){
    if (arr[i] < 0)
      return false;
  }

  return true;
}, Oscillator.hashIntArray);

Oscillator.powerOfTwoStretch = function(arr){

  var i=0, targetLength=1;
  var retStretchedArr = arr;

  while (targetLength < arr.length){
    i++;
    targetLength = Math.pow(2, i);
  }

  if (targetLength != arr.length){
    retStretchedArr = [];
    var stetchFactor = targetLength/arr.length;

    var max = arr.length;
    for (var k=0; k<max; k++){
      var newIndex = Math.floor((k+1) * stetchFactor) - 1;
      retStretchedArr[newIndex] = arr[k];
    }

    for (var l=retStretchedArr.length-2; l>=0; l--){
      if (retStretchedArr[l] == undefined){
        retStretchedArr[l] = retStretchedArr[l+1];
      }
    }
  }

  return retStretchedArr;
};

Oscillator.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Oscillator.hashIntArray = function(array){
  var ret = 0;
  for (var i=0; i<array.length; i++){
    if (Oscillator.isNumeric(array[i])){
      ret += ((i+1) * array[i]);
    }
  }
  return ret;
}


module.exports = Oscillator;
