baplib.org
baplets.io


['1.1.01', 'A01', null, 99, -50, -50, { other params} ]


Kit         Collection of Slots
Slot        Collection of Layers
Layer       Instrument(State)

Sequence    Collection of Patterns and Sequences
Pattern     Collection of Channels
Channel     Collection of Notes
Note        PositionState




the concept of Damu + Dilla, as Bap > bapjs.org
but what is missing?
- preview and trigger from browser
- control playback
- visualize notes, kits, layers...
- better sequencing, loop layering
- record output (Recorder.js + https://gist.github.com/pramodtech/8347621)
- slice sample, use pieces > kit js file
- mpc pad controller for kit > pattern js file
- sing input notes > pattern/sequence file
- load module from remote url?
- embed interactive on website? widget?
- transpose notes, i.e. change pattern from A1 to B2 with a function

IT MUST BE EXTREMELY MODULAR AND COMPOSABLE
perfect marriage between coding beats and MPC workflow in browser

bap.io
- HOW TO INSTALL AND GET STARTED GUIDES
- tips, tricks, tutorials
- sounds
- npm modules tagged as bap-kit, bap-module etc
- PLAYGROUND LIKE JSFIDDLE


bap dev toolchain
http://amokjs.com/
http://www.wavesurfer.fm/
https://github.com/NeoAlchemy/CodePen
http://wavepot.com
https://github.com/five23/audiopen
https://github.com/Zylann/AudioToy
https://github.com/meenie/band.js
http://overtone.github.io/

bap links https://gist.github.com/adamrenklint/9adf7e098ee4cbd43b76

random music with blip() http://jsfiddle.net/q8jt8o36/1/
https://github.com/jshanley/blip/wiki/API-Documentation
http://idroppedmyphonethescreencracked.tumblr.com/
http://microbeats.cc/
http://www.beatmakingvideos.com/category/studio-session

web audio envelope + synths: https://github.com/mattdiamond/synthjs
http://jsbin.com/vanonewawi/1/edit



https://github.com/Dinahmoe/tuna



----

// kit

var kit = bap.kit();
kit.slot(1).layer('sounds/kick.wav');
kit.slot(2).layer('sounds/snare.wav');
kit.slot(3).layer('sounds/hihat.wav');

// pattern
var pattern = bap.pattern(2 /*bars*/);
pattern.channel(1).add(
  ['*.1.01', 'A1'],
  ['*.2.1', 'A2']
);
//pattern.add(notes...) adds to new channel and returns
pattern.channel(2).add(
  ['*.*.01', 'A3']
);
// pattern.setLength(bars)

// when sounds are loaded, connect and play
bap.ready(function () {
  pattern.use('A', kit);
  pattern.start(/*loop?*/ true);
  pattern.loop
});

// or

bap(function () {
  // what if I try o add a layer in here, and load a sound?
});

// or should play just wait to start until all sounds are loaded?

or bap.play(pattern/sequence) or bap.run(pattern/sequence);

pattern.play() // start() || sequence.play() // > pattern.pause(), pattern.stop(), pattern.setPosition(), sequence.toNextBeat, toPrevBeat, toNextBar, toPrevBar, to LastStart//restart()

  > what if you can control and live-sequence the patterns and sequences?

  sequence.to(nextSequence)

  > and layer the ad-hoc?

  var newSeq = sequence.and(smallPattern)
  newSeq.with(outoSequence);
  or newSeq.without(outoSequence)

  > trigger kits, slots and layers live?

  kit.trigger(note or 'A1')
  kit.triggerAt(position, note || 'A1')
  (slot + layer).trigger(/*note*/) + triggerAt(pos, /*note*/)
  (kit,slot,layer).mute,muteAt,unmute,unmuteAt,solo,soloAt,unsolo,unsoloAt




----



  Bap           Wraps all constructors and is public event emitter
  Instrument    Virtual class
  Triggerable   Mixin: Able to be triggered with note event
    Kit
    Slot
    Layer
      Oscillator
      Sample
  Playable      Mixin: Playable list of note collections
    Sequence
    Pattern
  Channel       Notes collection
  Note          Note params model
  Position      Position parser/wrapper
  StepEvent     Start or stop event to be distributed to kit, slot, layer
  ExpressionExpander    can reuse Dilla


  Clock
    "step"
    setPosition()



## links

- [notes](http://newt.phys.unsw.edu.au/jw/notes.html) + http://www.contrabass.com/pages/frequency.html
- [old bap links](https://gist.github.com/adamrenklint/9adf7e098ee4cbd43b76)

## hiphop beatmaking/tracker vids

- https://www.youtube.com/watch?v=dd8l-5m0Ltw
- https://www.youtube.com/watch?v=_L1g0ldqcdc
- https://www.youtube.com/watch?v=XoS8fWO_EOs
- https://www.youtube.com/watch?v=bHBj-lkcVPM
- https://www.youtube.com/watch?v=5Xms_mcJNNE
- other beatmaking vids https://www.youtube.com/watch?v=K6yaZ7Subv4&index=2&list=RD_L1g0ldqcdc
- https://www.youtube.com/watch?v=gEiSkr6fWEc
- sp1200 https://www.youtube.com/watch?v=tFua7lgljr8

## dj premier

- https://www.youtube.com/watch?v=AaT4yaLZmBM
- https://www.youtube.com/watch?v=MZojloFB2q

## others

- http://taylorlivesthrough.bandcamp.com/album/the-weed-tape-reloaded


-----


pattern.channel()

  pos       key   dur   vol rate pan
[bap.position(1,1,1), ...]


USE -100 - 100 or -1 to 1 for params?


---

var entropic = blip.loop()
.tempo(110)
.tick(function(t,d) {
  if (blip.chance(1/3)) clip.play(t, { 'rate': blip.random(0.2, 1.4) });
})

entropic.start();

---


bap.sequence(
  introPattern,
  [2barDrumPattern, 2barSamplePattern],
  [bap.sequence(1barDrumPattern, 1barDrumPattern), 2barSamplePattern],
  [bap.sequence(1barDrumPattern).repeat(/*1*/), 2barSamplePattern],
  [bap.sequence(1barDrumPattern).repeat(3), 4barSamplePattern]
)


---

HOW DOES TEMPO WORK?
- where can tempo be set? pattern, sequence, globally?
- what overrides what? REMEMBER TO THINK "COMPOSABLE", BUT ALSO OUT OF THE BOX RE-USABLE...

---


a PATTERN is a collection of CHANNELS, each containing notes
many patterns can be sequenced or layered into a SEQUENCE
a sequence can also layer or sequence other sequences

a PATTERN connects its note ids to a kit
? a SEQUENCE can also define a (default) kit? but the lowest defined kit (.use()) is used?
or is a kit always connected to a pattern?
maybe there is a "connection function"? bap struct or simple function?
  (pattern, kitA, kitB) { return pattern.use('A', kitA).use('B', kitB) }
and for mixing
  (pattern, chainA, chainB, commonChain) {
    pattern.channel(1).out(chainA);
    pattern.channel(2).out(chainA, chainB);
    pattern.out(commonChain)
  }
- what about mixing vs channels vs sequences?


----


a KIT consists of SLOTS, each containing LAYERS
a layer contains params in seconds, i.e. offset, length, attack, release
while a NOTE contains params in ticks, i.e. duration
duration only overrides length when length is longer than duration, i.e. a sound is never playing longer than its layer is set as length prop


----

TRANSFORM NOTES

pattern.transform(function (note) {
note[1] = note[1].replace('A1', 'B2');
return note;
});

-----

REGISTER EXPRESSION EXPANDER

? bap.expander(function () { ... });


-----

REGISTER NOTE MODIFIERS

- add a function that is called before each start or stop event
- also called with all event params, to modify at end?


----

TIME/TICK BASED AUTOMATION


----

1)  bap library on npm
2)  bap lib documentation and examples (bap.io/bap.org)

x)  bap code playground (bap.ly/baplet.io)

x)  beatmaking with code TINYLETTER
    - https://vimeo.com/45026119
    - http://beatsdrummachine.com/
    - http://createdigitalmusic.com/2011/10/music-from-code-in-simple-text-live-coding-steve-reich-ian-rhythms-with-free-overtone/

------


could it be entirely functional, pure functions
i.e. GET INPUT > RETURN OUTPUT (NO OTHER SIDE EFFECTS) ?



----


- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://www.npmjs.com/package/beatsjs
- https://www.npmjs.com/package/bitcrusher
- https://www.npmjs.com/package/tinymusic
- https://www.npmjs.com/package/tone
- http://tonenotone.github.io/Tone.js/examples/score.html
- https://www.npmjs.com/package/neume.js
- http://mohayonao.github.io/neume.js/examples/buffer-work.html
- https://www.npmjs.com/package/web-audio-scheduler
- http://jshanley.github.io/blip/
- https://www.npmjs.com/package/sona
- https://github.com/jxnblk/bumpkit/blob/master/README.md
- http://mohayonao.github.io/web-audio-scheduler/
- https://github.com/stigi/mpc1k-node
- https://github.com/Marak/JSONloops
- https://github.com/Androguide/MPC2000XL
- https://github.com/meenie/band.js/
- http://www.one-tab.com/page/hLNxOIUuQAaRlOAYkI8E7Q
- http://funklet.com/its-a-new-day/
- http://www.cratekings.com/300-classic-hip-hop-drum-breaks-samples-and-loops/
- https://soundcloud.com/heap-rize
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://www.npmjs.com/package/beatsjs
- https://www.npmjs.com/package/bitcrusher
- https://www.npmjs.com/package/tinymusic
- https://www.npmjs.com/package/tone
- http://tonenotone.github.io/Tone.js/examples/score.html
- https://www.npmjs.com/package/neume.js
- http://mohayonao.github.io/neume.js/examples/buffer-work.html
- https://www.npmjs.com/package/web-audio-scheduler
- http://jshanley.github.io/blip/
- https://www.npmjs.com/package/sona
- http://mohayonao.github.io/web-audio-scheduler/
- https://github.com/stigi/mpc1k-node
- https://github.com/Marak/JSONloops
- https://github.com/Androguide/MPC2000XL
- http://zaach.github.io/jison/demos/
- http://middleearmedia.com/webaudioloopmixer/
- https://www.npmjs.com/package/wavesurfer.js
- lots of WA apps: https://twitter.com/reaktorplayer
- Audio News: http://audio.newsin136.cf/
- http://codepen.io/soulwire/pen/Dscga
- http://jxnblk.com/stepkit
- http://audiocrawl.co/
- http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
- http://sonantlive.bitsnbites.eu/tool
- https://github.com/plucked/html5-audio-editor
- http://en.wikipedia.org/wiki/Music_tracker
- http://en.wikipedia.org/wiki/FastTracker_2
- http://www.madtracker.org/about.php
- renoise http://createdigitalmusic.com/2007/07/renoise-19-music-app-begins-beta-why-you-shouldnt-overlook-this-tracker/
- http://web.textfiles.com/ezines/TRAXWEEKLY/
- http://obsoleteaudio.org/blog/2430
- http://www.buzzmachines.com/drumkits.php
- http://www.one-tab.com/page/hLNxOIUuQAaRlOAYkI8E7Q
- http://funklet.com/its-a-new-day/
- http://www.cratekings.com/300-classic-hip-hop-drum-breaks-samples-and-loops/

---

## mpc groove

- http://logic-pro-expert.com/logic-pro-blog/2011/11/18/mythbusting-the-special-groove-of-the-akai-mpc-series.html#.VR0dqHP8LqB
- http://blog.dubspot.com/swing-creative-use-of-groove-quantization/
- https://www.gearslutz.com/board/rap-hip-hop-engineering-production/457534-loose-grooves.html
- http://www.attackmagazine.com/features/roger-linn-swing-groove-magic-mpc-timing/

---

- http://blog.codinghorror.com/the-one-thing-programmers-and-musicians-have-in-common/
- http://stackoverflow.com/questions/14418530/record-sounds-from-audiocontext-web-audio-api
- http://chuck.cs.princeton.edu/doc/
- http://stackoverflow.com/questions/29135334/what-s-a-reliable-way-to-remove-an-ended-listener-from-an-audiobuffersourcenode
- http://www.academia.edu/970719/Behind_the_Beat_Technical_and_Practical_Aspects_of_Instrumental_Hip-Hop_Composition
