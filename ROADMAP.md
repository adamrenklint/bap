# Roadmap

## version 0.x

- Add bap.volume, a global volume parameter
- Clock methods for transition to sequence/pattern
- Allow trigger kit+slot from pattern
- Mute group, mute target, mute self (monophonic/polyphonic)
- Improve ```sample.slice()```
  - Rename sample.sliceExpression to sample.section
  - Allow sample.section to represent ranges, like ```1-4/9```
  - Allow passing an array of slice points to ```slice()```
- Cleaner solution than ```this.vent.bap```
- Bitcrusher effect / 12-bit master MPC60 mode

## version 1.0 "primo"

- Website with proper docs and examples



## Random ideas

- Public minified CDN version for use in JSFiddle
- Embeddable player widget (or solved by JSFiddle?)
- UI toolkit with playback controls and object representations
- Example that records output with Recorder.js + https://gist.github.com/pramodtech/8347621
- App for visual slicing and management of samples, output to Bap js modules
- MPC-like controller interface for recording patterns, output to Bap js modules
