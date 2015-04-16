# Bap

Beatmaking and sequence composition toolkit, using Javascript and Web Audio

Made by [Adam Renklint](http://adamrenklint.com)

**BEWARE, THIS IS ALPHA SOFTWARE. NOT READY YET.**

[![Join the chat at https://gitter.im/adamrenklint/bap](https://img.shields.io/badge/GITTER-join_chat-blue.svg?style=flat-square)](https://gitter.im/adamrenklint/bap) [![npm](https://img.shields.io/npm/v/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![npm](https://img.shields.io/npm/dm/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![GitHub stars](https://img.shields.io/github/stars/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/stargazers) [![GitHub forks](https://img.shields.io/github/forks/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/network)

[![Travis branch](https://img.shields.io/travis/adamrenklint/bap/dev.svg?style=flat-square)](https://travis-ci.org/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![David dependencies](https://img.shields.io/david/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap) [![David devDependencies](https://img.shields.io/david/dev/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/adamrenklint.svg)](https://saucelabs.com/u/adamrenklint)

## Summary

> Public demos, examples

inspired by mpc workflow/concepts

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

// a pattern is a loop made up of channels and notes
var pattern = bap.pattern();
pattern.channel(1).add(
  ['*.*.01', 'A1']
);

// connect the kit, and play
pattern.use('A', kit).start();
```

### Positions

The clock runs at 96 ticks per beat, and the time signature looks like on an MPC: ```bar.beat.tick```.

### Example: metronome

```js
var kit = bap.kit();
var basic = bap.oscillator({
  attack: 0.001,
  release: 0.1,
  length: 0.08
});

// simple way
kit.slot(1).layer(basic.with({ 'frequency': 330 }));

// more verbose: create, build, then assign
var nextSlot = bap.slot();
nextSlot.layer(basic.with({ 'frequency': 440 }));
kit.slot(2, nextSlot);

var pattern = bap.pattern({ 'bars': 2, 'tempo': 140 });
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  ['*.2%1.01', 'A2']
);

pattern.use('A', kit).start();
```

### Example: drums



## API

### bap

- ```bap.kit(params)``` returns a new [kit](#kit)
- ```bap.slot()``` returns a new [slot](#slot)
- ```bap.layer()``` returns a new [layer](#layer)
- ```bap.pattern()``` returns a new [pattern](#pattern)
- ```bap.sequence()``` returns a new [sequence](#sequence)
- ```bap.channel()``` returns a new [channel](#channel)
- ```bap.note()``` returns a new [note](#note)

### kit

- ```kit.slot()``` returns blank slot assigned to next index
- ```kit.slot(index)``` returns existing or blank slot with index
- ```kit.slot(index, slot)``` set slot instance at index
- ```kit.trigger(note)``` trigger note immediately
- ```kit.triggerAt(position, note)``` trigger note at position
- ```kit.schedule(time, note)``` schedule future note

### slot

- ```slot.layer()``` returns a blank layer assigned to next index
- ```slot.layer(source)``` returns a new layer containing [source](#source), assigned to next index
- ```slot.layer(sampleSrc)``` returns a new layer containing [sample](#sample) with src, assigned to next index
- ```slot.layer(index)``` returns existing or blank layer with index
- ```slot.layer(index, layer)``` set layer instance at index
- ```slot.layer(index, source)``` creates a new layer containing [source](#source), assigns to index
- ```slot.layer(index, sampleSrc)``` creates a new layer containing [sample](#sample), assigns to index
- ```slot.trigger(note)``` trigger slot immediately with optional note params
- ```slot.triggerAt(position, note)``` trigger slot at position with optional note params
- ```slot.schedule(time, note)``` schedule trigger in future

### layer

- ```layer.set(source)``` define layer [source](#source)
- ```layer.trigger(note)``` trigger layer immediately with optional note params
- ```layer.triggerAt(position, note)``` trigger layer at position with optional note params
- ```layer.schedule(time, note)``` schedule trigger in future

### source

- sample, oscillator

### sample

### pattern

- is [playable](#playable) and automatically looped

### sequence

### channel

- ```pattern.add(notes...)``` add one or more notes (primitive or instances)

### note

### playable

- ```start()``` start playback
- ```pause()``` pause playback
- ```stop()``` pause playback and set position to 1.1.01
- ```restart()``` play from last start position
- ```loop()```
- ```unloop()```

## Develop

- ```npm install```
- ```npm start```
- ```npm test```
- ```npm run test:watch```
- ```npm run coverage```

## Contribute

## License

MIT © [Adam Renklint](http://adamrenklint.com)
