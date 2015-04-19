# Roadmap

## version 0.2 "marl"

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
- More sample params
  - sample channel: all, left or right
  - sample reverse: null=forward, true=reverse
  - sample loop: true or false
- Improve ```sample.slice()```
  - Rename sample.sliceExpression to sample.section
  - Allow sample.section to represent ranges, like ```1-4/9```
  - Allow passing an array of slice points to ```slice()```
- Callback to edit note while expanding expression
```js
['1.*.01', 'B1', ..., function (note) {
  // note.position === expanded position
  // can be used to make variations of expanded notes...
  note.volume = 100 - note.tick;
}]
```
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
