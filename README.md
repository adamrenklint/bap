# Bap

Beatmaking and sequence composition toolkit, using Javascript and Web Audio

Made by [Adam Renklint](http://adamrenklint.com)

**BEWARE, THIS IS ALPHA SOFTWARE. NOT READY YET.**

[![Join the chat at https://gitter.im/adamrenklint/bap](https://img.shields.io/badge/GITTER-join_chat-blue.svg?style=flat-square)](https://gitter.im/adamrenklint/bap) [![npm](https://img.shields.io/npm/v/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![npm](https://img.shields.io/npm/dm/bap.svg?style=flat-square)](https://www.npmjs.com/package/bap) [![GitHub stars](https://img.shields.io/github/stars/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/stargazers) [![GitHub forks](https://img.shields.io/github/forks/adamrenklint/bap.svg?style=flat-square)](https://github.com/adamrenklint/bap/network)

[![Travis branch](https://img.shields.io/travis/adamrenklint/bap/dev.svg?style=flat-square)](https://travis-ci.org/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/adamrenklint/bap.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/bap) [![David dependencies](https://img.shields.io/david/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap) [![David devDependencies](https://img.shields.io/david/dev/adamrenklint/bap.svg?style=flat-square)](https://david-dm.org/adamrenklint/bap#info=devDependencies)

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

[Demo](http://adamrenklint.github.io/bap/#metronome)

```js
var kit = bap.kit();
var basic = bap.oscillator({
  attack: 0.001,
  release: 0.1,
  length: 0.08
});

// shorthand, add copy of oscillator as layer on first slot
kit.slot(1).layer(basic.with({ frequency: 330 }));

// more verbose: create slot, append oscillator, then assign to kit
var nextSlot = bap.slot();
nextSlot.layer(basic.with({ frequency: 440 }));
kit.slot(2, nextSlot);

// create the pattern and add notes using expressions
var pattern = bap.pattern({ bars: 2, tempo: 140 });
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  ['*.2%1.01', 'A2']
);

pattern.use('A', kit).start();
```

### Example: samples

[Demo](http://adamrenklint.github.io/bap/#dilla-boombap)

```js
var drumKit = bap.kit();
// three ways to add a sample layer to a slot
drumKit.slot(1).layer('sounds/kick.wav');
var snare = bap.sample('sounds/snare.wav');
drumKit.slot(2).layer(snare);
drumKit.slot(3).layer(bap.sample({
  src: 'sounds/hihat.wav',
  volume: 50
}));

var plongKit = bap.kit();
plongKit.slot(1).layer(bap.sample({
  src: 'sounds/plong1.wav',
  duration: 95
}));
plongKit.slot(2).layer(bap.sample({
  src: 'sounds/plong2.wav',
  duration: 60
}));

var stringKit = bap.kit();
stringKit.slot(1).layer(bap.sample({
  src: 'sounds/string1.wav',
  duration: 90
}));
stringKit.slot(2).layer(bap.sample({
  src: 'sounds/string2.wav',
  duration: 70
}));
stringKit.slot(3).layer(bap.sample({
  src: 'sounds/string3.wav',
  duration: 45
}));

var bassKit = bap.kit();
bassKit.slot(1).layer(bap.sample({
  src: 'sounds/bass.wav',
  attack: 0.01,
  release: 0.01
}));

var boombapPattern = bap.pattern({ bars: 2, tempo: 90 });
boombapPattern.channel(1).add(
  ['1.1.01', 'A01'],
  ['1.1.51', 'A01', null, 80],
  ['1.1.91', 'A02'],
  ['1.2.88', 'A01'],
  ['1.3.75', 'A01'],
  ['1.3.91', 'A02'],
  ['1.4.72', 'A01', null, 80],
  ['2.1.91', 'A02'],
  ['2.1.51', 'A01', null, 70],
  ['2.3.51', 'A01', null, 80],
  ['2.3.88', 'A01'],
  ['2.4.03', 'A02']
);

boombapPattern.channel(2).add(
  ['*.odd.01', 'A03', null, 70],
  ['*.even.01', 'A03', null, 80],
  ['*.4.53', 'A03', null, 60]
);

boombapPattern.channel(3).add(
  ['1.1.01', 'B01'],
  ['1.4.90', 'B02', null, 40],
  ['2.1.52', 'B02', null, 70]
);

boombapPattern.channel(4).add(
  ['1.2.05', 'C03', null, 60],
  ['1.2.51', 'C03', null, 40],
  ['1.3.05', 'C03', null, 20],
  ['1.3.51', 'C03', null, 5],
  ['1.3.75', 'C01', null, 60],
  ['1.4.52', 'C01', null, 20],
  ['2.2.05', 'C03', null, 60],
  ['2.2.50', 'C02', null, 60],
  ['2.3.25', 'C01', 70, 60],
  ['2.4.01', 'C01', 85, 30],
  ['2.4.75', 'C01', 85, 10]
);

boombapPattern.channel(5).add(
  ['1.1.01', 'D01', 60, 80, -90],
  ['1.2.72', 'D01', 15, 50, -90],
  ['1.3.02', 'D01', 40, 80, -90],
  ['1.4.01', 'D01', 40, 60, -72],
  ['1.4.51', 'D01', 100, 80, -52],
  ['2.3.51', 'D01', 60, 80, -116],
  ['2.4.51', 'D01', 40, 80, -96]
);

boombapPattern
  .use('A', drumKit)
  .use('B', plongKit)
  .use('C', stringKit)
  .use('D', bassKit)
  .start();
```

### Example: slices

[Demo](http://adamrenklint.github.io/bap/#slices)

```js
var sampleKit = bap.kit();
var base = bap.sample({
  src: 'sounds/slices.wav',
  attack: 0.01,
  release: 0.01
});
sampleKit.slot(1).layer(base.with({
  offset: 0.072,
  length: 0.719
}));
sampleKit.slot(2).layer(base.with({
  offset: 0.9,
  length: 0.750
}));
sampleKit.slot(3).layer(base.with({
  offset: 1.68,
  length: 0.690
}));
sampleKit.slot(4).layer(base.with({
  offset: 9.49,
  length: 2
}));

var breakKit = bap.sample({
  src: 'sounds/esther.wav',
  pitch: -26
}).slice(16);
breakKit.slot(1).layer('sounds/kick.wav');
breakKit.slot(2).layer('sounds/snare.wav');
breakKit.slot(4).layer('sounds/snare.wav');

var pattern = bap.pattern({ bars: 2, tempo: 95 });
pattern.channel(1).add(
  ['1.1.01', 'A1', 96],
  ['1.2.01', 'A1', 96],
  ['1.3.01', 'A2'],
  ['2.1.01', 'A3'],
  ['2.2.80', 'A4', (96 * 2) + 16 ]
);

pattern.channel(2).add(
  ['1.1.01', 'B1'],
  ['1.2.01', 'B2'],
  ['1.3.01', 'B3'],
  ['1.4.01', 'B4'],
  ['2.1.01', 'B1'],
  ['2.2.01', 'B2'],
  ['2.3.01', 'B8'],
  ['2.4.01', 'B9'],
  ['2.4.49', 'B5', 48]
);

pattern
  .use('A', sampleKit)
  .use('B', breakKit)
  .start();
```

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
