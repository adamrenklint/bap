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

### Time signature

Bap runs at 96 ticks per beat, and the time signature looks like on an MPC: ```bar.beat.tick```.

### Adding notes

- six main attributes of a note: position, key, duration, volume, pitch, pan
- use expressions

### Examples

- [Metronome](http://adamrenklint.github.io/bap/#metronome)
- [Boombap beat](http://adamrenklint.github.io/bap/#dilla-boombap)
- [Sample slices](http://adamrenklint.github.io/bap/#slices)

## API

## Develop

- ```npm install``` install all dependencies
- ```npm start``` run examples development server
- ```npm test``` run unit tests
- ```npm run test:watch``` run and watch unit tests
- ```npm run coverage``` generate coverage report with Istanbul

## Contribute

## License

MIT © [Adam Renklint](http://adamrenklint.com)
