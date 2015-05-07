# Changelog

## version 0.2 "marl" (2015-05-07)

- Added ```bap.sequence```, multi-layered sequences from patterns and other sequences, with variable tempo
- Added ```pattern.then```, ```pattern.after``` and ```pattern.and``` methods for combining patterns and sequences into new sequence
- Added ```sample.channel``` param to define behavior for stereo buffers
- Added ```sample.reverse``` param to reverse buffer or slice of buffer
- Added ```sample.loop``` param to define looping behavior
- Added ```note.transform```, ```channel.transform``` and ```pattern.transform``` callback to allow modification of notes after expanding position expressions
- Added ```bap.clock.tempo``` read-only attribute for getting current tempo
- Added ```bap.clock.step``` callback to cancel scheduling of step
- Updated to [dilla v1.5](https://www.npmjs.com/package/dilla) and [dilla-expressions v2.0](https://www.npmjs.com/package/dilla-expressions):
  - Added *greater than* and *less than* position expression operators
  - Expressions engine performance boost 25-1500x

## version 0.1 "damu" (2015-04-19)

- Initial public release
