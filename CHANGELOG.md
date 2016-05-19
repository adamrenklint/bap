# Changelog

## v0.5.1 (2016-05-19) [diff](https://github.com/adamrenklint/bap/compare/v0.4.1...v0.5.0)

- Fixed setting `pattern.volume` to `0` playing at full volume [#44](https://github.com/adamrenklint/bap/issues/44)

## v0.5 "lotus" (2015-05-12) [diff](https://github.com/adamrenklint/bap/compare/v0.4.1...v0.5.0)

- Added `bap.new()` method to create a completely new instance of Bap, with its clock and event bus separated from all other instances [#43](https://github.com/adamrenklint/bap/issues/43)

## v0.4.1 (2016-05-11) [diff](https://github.com/adamrenklint/bap/compare/v0.4.0...v0.4.1)

- Updated [Dilla](https://github.com/adamrenklint/dilla) to fix an issue with dropping notes on patterns with more than 9 beats per bar [#42](https://github.com/adamrenklint/bap/issues/42)

## v0.4 "apollo" (2015-10-07) [diff](https://github.com/adamrenklint/bap/compare/v0.3.0...v0.4.0)

- **BREAKING:** Changed bitcrusher normalization frequency attribute to a proper frequency range [#37](https://github.com/adamrenklint/bap/issues/37)
- Added ```connect``` method to kit, slot, layer, channel and note, making them connectable with bap effect factories, using smart, dynamic and performant node creation and routing
- Added reverb, delay, compressor, overdrive, filter, chorus, phaser and ping pong delay effect factories for sample and oscillator layers [#15](https://github.com/adamrenklint/bap/issues/15)
- Added pattern volume attribute and master bap.volume attribute
- Added ```trimToZeroCrossingPoint``` param to trim clipping edges from beginning and end from sample buffers
- Improved performance and memory footprint with general object and Web Audio node pooling, avoiding V8 deopt patterns and allocating temporary memory
- Removed memoization of lookahead steps for pattern or sequence that is not looping or longer than 16 bars

## v0.3 "pete" (2015-09-03) [diff](https://github.com/adamrenklint/bap/compare/v0.2.2...v0.3.0)

- Added bitcrusher effect for sample layers [#23](https://github.com/adamrenklint/bap/issues/23)
- Added ```note.after``` callback that is triggered after a note source has stopped playing
- Added `clock.looped` attribute, increases each time a sequence reaches its end
- Added ```trigger``` param on note [#24](https://github.com/adamrenklint/bap/issues/24)
- Deprecated ```key``` parameter on note [#24](https://github.com/adamrenklint/bap/issues/24)
- Changed ```pattern > kit``` connection to use numeric ids [#24](https://github.com/adamrenklint/bap/issues/24)
- Changed ```kit > slot``` connection to use ```QWERTY``` ids [#24](https://github.com/adamrenklint/bap/issues/24)
- Fixed error when reversing sample without offset and duration longer than actual buffer duration [#25](https://github.com/adamrenklint/bap/issues/25)
- Fixed `clock.tempo` dropping to 0 when pausing or stopping playback
- Fixed `bap.clock` trowing error when starting playback without sequence
- Fixed playback being completely broken in Safari and Mobile Safari [#30](https://github.com/adamrenklint/bap/issues/30)

## v0.2.2 (2015-05-26) [diff](https://github.com/adamrenklint/bap/compare/v0.2.1...v0.2.2)

- Fixed broken links to examples in README

## v0.2.1 (2015-05-10) [diff](https://github.com/adamrenklint/bap/compare/v0.2.0...v0.2.1)

- Fixed incorrectly formatted header comments in ```bap.min.js```

## v0.2 "marl" (2015-05-07) [diff](https://github.com/adamrenklint/bap/compare/v0.1.0...v0.2.0)

- Added ```bap.sequence```, multi-layered sequences from patterns and other sequences, with variable tempo
- Added ```pattern.then```, ```pattern.after``` and ```pattern.and``` methods for combining patterns and sequences into new sequence
- Added ```sample.channel``` param to define behavior for stereo buffers
- Added ```sample.reverse``` param to reverse buffer or slice of buffer
- Added ```sample.loop``` param to define looping behavior
- Added ```note.transform```, ```channel.transform``` and ```pattern.transform``` callback to allow modification of notes after expanding position expressions
- Added ```clock.tempo``` read-only attribute for getting current tempo
- Added ```clock.step``` callback to cancel scheduling of step
- Updated to [dilla v1.5](https://www.npmjs.com/package/dilla) and [dilla-expressions v2.0](https://www.npmjs.com/package/dilla-expressions):
  - Added *greater than* and *less than* position expression operators
  - Expressions engine performance boost 25-1500x

## v0.1 "damu" (2015-04-19) [diff](https://github.com/adamrenklint/bap/compare/a31c03fd0e95c7cace5615c37db5eebdec877f95...v0.1.0)

- Initial public release

---
*Generated with [redok](https://github.com/adamrenklint/redok) @ Thursday May 19th, 2016 - 10:38:36 AM*