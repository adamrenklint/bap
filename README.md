# Bap

Beatmaking and sequence composition toolkit, using Javascript and Web Audio

Made by [Adam Renklint](http://adamrenklint.com)

**BEWARE, THIS IS ALPHA SOFTWARE. NOT READY YET.**

[![Join the chat at https://gitter.im/adamrenklint/bap](https://img.shields.io/badge/GITTER-join_chat-blue.svg?style=flat-square)](https://gitter.im/adamrenklint/bap) [![npm](https://img.shields.io/npm/v/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![npm](https://img.shields.io/npm/dm/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![GitHub stars](https://img.shields.io/github/stars/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/stargazers) [![GitHub forks](https://img.shields.io/github/forks/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/network)

[![Travis branch](https://img.shields.io/travis/adamrenklint/bap/dev.svg?style=flat-square)](https://travis-ci.org/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![David dependencies](https://img.shields.io/david/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap) [![David devDependencies](https://img.shields.io/david/dev/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap#info=devDependencies)

[Bap](http://bapjs.org) is a Javascript library for making beats and composing music for browsers with Web Audio. It is heavily inspired by the classic "MPC workflow" and has an internal clock based on 96 ticks per beat.

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
  frequency: 440,
  duration: 48
});
// a kit connects infinite slots with infinite layers
kit.slot(1).layer(oscillator);
kit.slot(2).layer(bap.sample('foo.wav'));

// a pattern is a loop made up of channels and notes
var pattern = bap.pattern();
pattern.channel(1).add(
  ['1.*.01', 'A1'],
  ['1.2.01', 'A2']
);

// connect the kit, and play
pattern.use('A', kit).start();
```

## Basic concepts

- Bap runs at *96 ticks per beat*, with a position signature like MPC: ```bar.beat.tick```
- Kit are like instruments (programs in MPC terms) and contains infinite slots, each with infinite layers of samples and oscillators
- Patterns are collections of channels containing notes, and connect with kits
- Notes are defined by six main parameters: position, key, duration, volume, pan and pitch
- Only position and key params are required, all others can be null/falsy/undefined
- Positions containing [expressions](https://github.com/adamrenklint/dilla-expressions#operators) are automatically expanded
- When a layer is played, it merges the params of the note, channel, layer, slot and kit

## Examples

- [Metronome](http://examples.bapjs.org/#metronome)
- [Boombap beat](http://examples.bapjs.org/#dilla-boombap)
- [Sample slices](http://examples.bapjs.org/#slices)

## API

### bap

- ```bap.kit(params)``` returns a new [kit](#kit)
- ```bap.slot(params)``` returns a new [slot](#slot)
- ```bap.layer(params)``` returns a new [layer](#layer)
- ```bap.pattern(params)``` returns a new [pattern](#pattern)
- ```bap.channel(params)``` returns a new [channel](#channel)
- ```bap.note(params)``` returns a new [note](#note)
- ```bap.oscillator(params)``` returns a new [note](#oscillator)
- ```bap.sample(params)``` returns a new [note](#sample)

#### params

##### common

- ```mute``` boolean, defaults to ```false```
- ```pan``` number between ```-100``` and ```100```, defaults to ```0```
- ```volume``` number between ```0``` and ```999```, defaults to ```100```
- ```length``` trigger length in seconds
- ```duration``` trigger length in ticks
- ```attack``` trigger attack in seconds
- ```release``` trigger release in seconds
- ```pitch``` number between ```-999``` and ```999```, defaults to ```0```

##### sample

- ```src``` string, url used to load sample buffer
- ```offset``` number, starting point offset in seconds, defaults to ```0```

### kit

- ```kit.slot()``` returns blank slot assigned to next id
- ```kit.slot(index)``` returns existing or blank slot with id
- ```kit.slot(index, slot)``` set slot instance at id

## Develop

- ```npm install``` install all dependencies
- ```npm start``` run examples development server
- ```npm test``` run unit tests
- ```npm run test:watch``` run and watch unit tests
- ```npm run coverage``` generate coverage report with Istanbul

## Contribute

## License

MIT © [Adam Renklint](http://adamrenklint.com)
