# Changelog

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
