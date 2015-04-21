[![Bap](https://raw.githubusercontent.com/adamrenklint/bap-logo/master/dist/bap-medium.png)](http://bapjs.org)

[![Join the chat at https://gitter.im/adamrenklint/bap](https://img.shields.io/badge/GITTER-join_chat-blue.svg?style=flat-square)](https://gitter.im/adamrenklint/bap) [![npm](https://img.shields.io/npm/v/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![npm](https://img.shields.io/npm/dm/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![GitHub stars](https://img.shields.io/github/stars/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/stargazers) [![GitHub forks](https://img.shields.io/github/forks/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/network)

[![Travis branch](https://img.shields.io/travis/adamrenklint/bap/dev.svg?style=flat-square)](https://travis-ci.org/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![David dependencies](https://img.shields.io/david/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap) [![David devDependencies](https://img.shields.io/david/dev/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap#info=devDependencies)

[Bap](http://bapjs.org) is a small Javascript library for making beats and composing sequences of Web Audio events for playback in modern browsers. It is inspired by the classic "MPC workflow" and built to make all aspects of beatmaking completely modular and reusable.

**The project is in an early stage, and things may change and break between minor versions.**

Made by [Adam Renklint](http://adamrenklint.com), Berlin april 2015

## Install

```sh
$ npm install --save bap
```

## Usage

```js
var bap = require('bap');

// a kit is like an instrument, or program in mpc terms
var kit = bap.kit();
var oscillator = bap.oscillator({
  frequency: 440
});
// a kit connects infinite slots with infinite layers
kit.slot(1).layer(oscillator);
kit.slot(2).layer(oscillator.with({ frequency: 330 }));
kit.slot(3).layer(bap.sample('foo.wav'));

// a pattern is a loop made up of channels and notes
var pattern = bap.pattern();
pattern.channel(1).add(
  ['1.*.01', 'A1', 48, 70, 0, -50],
  ['1.2.01', 'A2', 96, 100, 0, 50],
  ['1.4.01', 'A3']
);

// connect the kit, and play
pattern.kit('A', kit).start();
```

## Basic concepts

- Bap runs at *96 ticks per beat*, with a position signature like MPC: ```bar.beat.tick```
- Kit are like instruments (programs in MPC terms) and contains infinite slots, each with infinite layers of samples and oscillators
- Patterns are playable collections of channels containing notes, and connect with kits
- Notes are defined by six main parameters: position, key, duration, volume, pan and pitch
- Only position and key params are required, all others can be null/falsy/undefined
- Positions containing [expressions](https://github.com/adamrenklint/dilla-expressions#operators) are automatically expanded
- When a layer is played, it merges the params of the note, channel, layer, slot and kit

## Resources

- [Changelog](https://github.com/adamrenklint/bap/blob/master/changelog.md)
- [Roadmap](https://github.com/adamrenklint/bap/blob/master/roadmap.md)
- Examples
  - [Metronome](http://examples.bapjs.org/#metronome)
  - [Boombap beat](http://examples.bapjs.org/#boombap)
  - [Sample slices](http://examples.bapjs.org/#slices)
- [Related links](https://github.com/adamrenklint/bap/blob/master/links.md)

## API

- All objects are based on [ampersand-state](https://github.com/AmpersandJS/ampersand-state)
- ```on(name, callback)``` register event callback
- ```off(name, [callback])``` unregister event callback
- ```once(name, callback)``` register single-run event callback
- ```with(params)``` return a clone of itself with params
- ```toJSON()``` return current params as JSON

### bap

- ```kit(params)``` returns a new [kit](#kit)
- ```slot(params)``` returns a new [slot](#slot)
- ```layer(params)``` returns a new [layer](#layer)
- ```oscillator(params)``` returns a new [oscillator](#oscillator)
- ```sample(params)``` returns a new [sample](#sample)
- ```pattern(params)``` returns a new [pattern](#pattern)
- ```channel(params)``` returns a new [channel](#channel)
- ```note(params)``` returns a new [note](#note)
- ```clock``` reference to [clock](#clock) instance

#### params

- ```mute``` boolean, defaults to ```false```
- ```pan``` number between ```-100``` and ```100```, defaults to ```0```
- ```volume``` number between ```0``` and ```999```, defaults to ```100```
- ```length``` trigger length in seconds
- ```duration``` trigger length in ticks
- ```attack``` trigger attack in seconds
- ```release``` trigger release in seconds
- ```pitch``` number between ```-999``` and ```999```, defaults to ```0```

### clock

- ```start()``` start playback, if current pattern is set
- ```start(pattern)``` set current pattern and start playback
- ```pause()``` stop playback
- ```stop()``` stop playback and set position to ```1.1.01```
- ```playing``` boolean, current state of playback, can be set to start or pause

### kit

- ```slot()``` returns blank slot assigned to next id
- ```slot(id)``` returns existing or blank slot with id
- ```slot(id, slot)``` assign slot instance to id
- ```slot(slot)``` assign slot instance to next id

### slot

- ```layer()``` returns a blank layer assigned to next id
- ```layer(id)``` returns existing or blank layer with id
- ```layer(id, layer)``` assign layer instance to id
- ```layer(layer)``` assign layer instance to next id
- ```layer(sampleSrc)``` returns a new [sample](#sample) layer, assigned to next id
- ```start(time, [params])``` start playback of slot at (AudioContext) time
- ```start([params])``` start playback of slot immediately
- ```stop(time, [params])``` stop playback of slot at (AudioContext) time
- ```stop([params])``` stop playback of slot immediately

### layer

- ```start(time, [params])``` start playback of slot at (AudioContext) time
- ```start([params])``` start playback of slot immediately

#### oscillator

- ```frequency``` number, frequency of oscillation in hertz, defaults to ```0```
- ```note``` string, [note identifier](https://github.com/gre/audio-notes) like ```C3``` or ```a4``` - if set, overrides frequency
- ```shape``` string, shape of waveform, defaults to ```sine```, other values are ```square```, ```sawtooth```, ```triangle``` and ```custom```

#### sample

- ```src``` string, url used to load sample buffer
- ```offset``` number, starting point offset in seconds, defaults to ```0```
- ```slice(pieces)``` returns a kit with the sample sliced into even-sized sections

### pattern

- ```channel()``` returns a blank channel assigned to next id
- ```channel(id)``` returns existing or blank channel with id
- ```channel(id, channel)``` assign channel instance to id
- ```channel(channel)``` assign channel instance to next id
- ```start()``` start playback of pattern
- ```pause()``` stop playback
- ```stop()``` stop playback and set position to ```1.1.01```
- ```kit(id, kit)``` connect kit to id
- ```kit(id)``` return kit connected to id
- ```playing``` boolean, current state of playback, can be set to start or pause
- ```tempo``` number, playback tempo in bpm, defaults to ```120```
- ```bars``` number, length of pattern in bars, defaults to ```1```
- ```beatsPerBar``` number, amount of beats per bar, defaults to ```4```

### channel

- ```add(note, note, ...)``` schedule note(s) to be played within context of channel

### note

- ```start([time])``` start playback of note at (AudioContext) time or immediately
- ```stop([time])``` stop playback of note at (AudioContext) time or immediately

## Feedback and issues

- Report bugs with [Github issues](https://github.com/adamrenklint/bap/issues)
- Ask questions on [Gitter](https://gitter.im/adamrenklint/bap)
- Send shoutouts on [Twitter](http://twitter.com/adamrenklint)
- Or just [email me](mailto:adam@renklint.com)

## Develop

- ```npm install``` install all dependencies
- ```npm start``` run examples development server
- ```npm test``` run unit tests
- ```npm run test:watch``` run and watch unit tests
- ```npm run coverage``` generate coverage report with Istanbul
- ```npm publish``` run tests, publish to npm, tag version and deploy examples

## Contribute

- Check the [roadmap](https://github.com/adamrenklint/bap/blob/master/roadmap.md) and [open issues](https://github.com/adamrenklint/bap/issues)
- Fork the repo
- Add tests and/or examples
- Submit a pull request

## Props

- [Roger Linn](http://en.wikipedia.org/wiki/Roger_Linn) for making [MPC60](http://en.wikipedia.org/wiki/Akai_MPC60)
- [Marley Marl](http://en.wikipedia.org/wiki/Marley_Marl) for innovating the art of sampling
- [DJ Premier](http://en.wikipedia.org/wiki/DJ_Premier), [J Dilla](http://en.wikipedia.org/wiki/J_Dilla), [Pete Rock](http://en.wikipedia.org/wiki/Pete_Rock), [Damu the Fudgemunk](http://en.wikipedia.org/wiki/Damu_the_Fudgemunk), [Black Milk](http://en.wikipedia.org/wiki/Black_Milk), [Large Professor](http://en.wikipedia.org/wiki/Large_Professor) and [Apollo Brown](https://apollobrown.bandcamp.com) for making dope beats to be inspired from
- [Matt McKegg](https://twitter.com/MattMcKegg) for building [Bopper](https://github.com/mmckegg/bopper) and [Ditty](https://github.com/mmckegg/ditty), which are used in this project since version 0.1

## License

MIT © 2015 [Adam Renklint](http://adamrenklint.com)
