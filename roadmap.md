# Roadmap

## version 0.2 "marl"



    bap.transformStep() // add a step transform handler

    ----


    http://api.jquery.com/



    seq conv methods for joining
    repeating


    seq.before(seq2)  >> seq3([seq2, seq])
    seq.after(seq2)   >> seq3([seq, seq2])
    seq.and(seq2)     >> seq3([[seq, seq2]])


    seq.slice(pos)    >> return clone with all notes before POS removed






    seq.repeat() // > twice
    seq.repeat(2) // > thrice
    seq.repeat(3) // > four times

    seq.times(1) // return self
    seq.times(2) // return self.repeat()




    ------

    patternOrSequence.reverse()    >>>> USELESS??? is there a need?

      1.1.01 => 1.4.96
      1.2.49 => 1.3.49
      1.4.96 => 1.1.01





- try exponentialRampToValueAtTime for attack and release, maybe also add startVolume and endVolume params, working same as volume

- Clean up use of vent, that weird tempo event - one way of doing GLOBAL COMM

- Add bap.volume, a global volume parameter
- Cancel scheduled but not started events on pause/stop
- Sequences, because patterns were only the beginning
```js
bap.sequence(
  introPattern,
  [2barDrumPattern, 2barSamplePattern],
  [bap.sequence(1barDrumPattern, 1barDrumPattern), 2barSamplePattern],
  [bap.sequence(1barDrumPattern).repeat(/*1*/), 2barSamplePattern],
  [bap.sequence(1barDrumPattern).repeat(3), 4barSamplePattern]
);
```
- Clock methods for transition to sequence/pattern
- Allow trigger kit+slot from pattern
- Mute group, mute target, mute self (monophonic/polyphonic)
- Improve ```sample.slice()```
  - Rename sample.sliceExpression to sample.section
  - Allow sample.section to represent ranges, like ```1-4/9```
  - Allow passing an array of slice points to ```slice()```
- Cleaner solution than ```this.vent.bap```
- Effects and chains
```js
var fx1 = bap.compressor();
var chain = bap.chain(fx1, fx2...);
kit.dest(chain).send(chain2, amount);
kit.slot(2).dest(fx1);
```
- Transpose notes to new pattern
```js
var newPattern = pattern.transpose(function (note) {
  note.key = note.key.replace('A', 'Q');
});
```

## version 0.x

## version 1.0 "primo"

- Website with proper docs and examples



## Random ideas

- Public minified CDN version for use in JSFiddle
- Embeddable player widget (or solved by JSFiddle?)
- UI toolkit with playback controls and object representations
- Example that records output with Recorder.js + https://gist.github.com/pramodtech/8347621
- App for visual slicing and management of samples, output to Bap js modules
- MPC-like controller interface for recording patterns, output to Bap js modules
