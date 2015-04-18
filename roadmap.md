# Roadmap

## version 0.2 "marl"

- Add bap.volume, a global volume parameter
- Cancel scheduled but not started events on pause/stop
- Sequences, because patterns were only the beginning
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

## version 1.0 "primo"

- Website with proper docs and examples
