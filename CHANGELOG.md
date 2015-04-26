# Changelog

## version 0.2 "marl"

- Added ```bap.sequence``` object for creating multi-layered sequences from patterns and other sequences
- Added ```pattern.then```, ```pattern.after``` and ```pattern.and``` methods for combining patterns and sequences into new sequence
- Added ```sample.channel``` param to define behavior for stereo buffers
- Added ```sample.reverse``` param to reverse buffer or slice of buffer
- Added ```sample.loop``` param to define looping behavior
- Added ```note.transform``` and ```channel.transform``` to allow modification of notes after expanding position expressions
- Added ```bap.clock.tempo``` attribute for getting and setting current tempo
- Added ```bap.clock.step``` attribute to cancel step scheduling or change params
- Updated to [dilla v1.4](https://www.npmjs.com/package/dilla) and [dilla-expressions v1.2](https://www.npmjs.com/package/dilla-expressions) for support of *greater than* and *less than* position expression operators

## version 0.1 "damu" (2015-04-19)

- Initial public release
