var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var Channel = require('../../lib/Channel');
var Pattern = require('../../lib/Pattern');
var Note = require('../../lib/Note');
var channel;

beforeEach(function () {
  channel = new Channel();
});

describe('Channel', function () {

  describe('add(note, ...)', function () {
    describe('when note is a raw object', function () {
      it('should create a note instance', function () {
        channel.add(['1.1.01', 'A1']);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0].type).to.equal('note');
      });
      it('should add a ghost to expandedNotes', function () {
        channel.add(['1.1.01', 'A1']);
        expect(channel.expandedNotes.filter(function (note) {
          return note.original = channel.rawNotes.models[0];
        }).length).to.equal(1);
      });
    });
    describe('when passing a note instance', function () {
      it('should just add the note', function () {
        var note = new Note({ position: '2.1.02', key: 'B5' });
        channel.add(note);
        expect(channel.rawNotes.length).to.equal(1);
        expect(channel.rawNotes.models[0]).to.equal(note);
      });
      it('should add a ghost to expandedNotes', function () {
        var note = new Note({ position: '2.1.02', key: 'B5' });
        channel.add(note);
        expect(channel.expandedNotes.filter(function (note) {
          return note.original = channel.rawNotes.models[0];
        }).length).to.equal(1);
      });
    });
    it('should be chainable', function () {
      expect(channel.add()).to.equal(channel);
    });
  });

  describe('transforms(note)', function () {
    describe('when note is not a valid note', function () {
      it('should throw a meaningful error', function () {
        expect(function () {
          channel.transforms();
        }).to.throw('note is not an instance of bap.note');
      });
    });
    describe('when note does not have a transform function', function () {
      describe('when channel has a transform function', function () {
        describe('when channel is not part of a pattern', function () {
          it('should return a function that applies the channel transform', function () {
            var note = new Note({ position: '1.1.02' });
            channel.transform = function (n) {
              n.tick += 10;
            };
            var fn = channel.transforms(note);
            fn(note);
            expect(note.position).to.equal('1.1.12');
          });
        });
        describe('when channel is part of a pattern', function () {
          describe('when pattern has a transform function', function () {
            it('should return a function that applies the channel + pattern transform', function () {
              var note = new Note({ position: '1.1.02' });
              channel.transform = function (n) {
                n.tick += 10;
              };
              var pattern = new Pattern();
              pattern.transform = function (n) {
                if (n.tick === 12) {
                  n.tick = 18;
                }
              };
              pattern.channel(channel);
              var fn = channel.transforms(note);
              fn(note);
              expect(note.position).to.equal('1.1.18');
            });
          });
          describe('when pattern does not have a transform function', function () {
            it('should return a function that applies the channel transform', function () {
              var note = new Note({ position: '1.1.02' });
              channel.transform = function (n) {
                n.tick += 10;
              };
              var pattern = new Pattern();
              pattern.channel(channel);
              var fn = channel.transforms(note);
              fn(note);
              expect(note.position).to.equal('1.1.12');
            });
          });
        });
      });
      describe('when channel does not have a transform function', function () {
        describe('when channel is not part of a pattern', function () {
          it('should return false', function () {
            var note = new Note({ position: '1.1.02' });
            var fn = channel.transforms(note);
            expect(fn).to.be.false;
          });
        });
        describe('when channel is part of a pattern', function () {
          describe('when pattern has a transform function', function () {
            it('should return a function that applies the pattern transform', function () {
              var note = new Note({ position: '1.1.02' });
              var pattern = new Pattern();
              pattern.transform = function (n) {
                n.tick += 20;
              };
              pattern.channel(channel);
              var fn = channel.transforms(note);
              fn(note);
              expect(note.position).to.equal('1.1.22');
            });
          });
          describe('when pattern does not have a transform function', function () {
            it('should return false', function () {
              var note = new Note({ position: '1.1.02' });
              var pattern = new Pattern();
              pattern.channel(channel);
              var fn = channel.transforms(note);
              expect(fn).to.be.false;
            });
          });
        });
      });
    });
    describe('when note has a transform function', function () {
      describe('when channel has a transform function', function () {
        describe('when channel is not part of a pattern', function () {
          it('should return a function that applies the note + channel transform', function () {
            var note = new Note({ position: '1.1.02' });
            note.transform = function (n) {
              n.tick += 30;
            };
            channel.transform = function (n) {
              if (n.tick === 32) {
                n.tick = 45;
              }
            };
            var fn = channel.transforms(note);
            fn(note);
            expect(note.position).to.equal('1.1.45');
          });
        });
        describe('when channel is part of a pattern', function () {
          describe('when pattern has a transform function', function () {
            it('should return a function that applies the note + channel + pattern transform', function () {
              var note = new Note({ position: '1.1.02' });
              note.transform = function (n) {
                n.tick += 30;
              };
              channel.transform = function (n) {
                if (n.tick === 32) {
                  n.tick = 45;
                }
              };
              var pattern = new Pattern();
              pattern.transform = function (n) {
                if (n.tick === 45) {
                  n.tick = 96;
                }
              };
              pattern.channel(channel);
              var fn = channel.transforms(note);
              fn(note);
              expect(note.position).to.equal('1.1.96');
            });
          });
          describe('when pattern does not have a transform function', function () {
            it('should return a function that applies the note + channel transform', function () {
              var note = new Note({ position: '1.1.02' });
              note.transform = function (n) {
                n.tick += 30;
              };
              channel.transform = function (n) {
                if (n.tick === 32) {
                  n.tick = 45;
                }
              };
              var pattern = new Pattern();
              pattern.channel(channel);
              var fn = channel.transforms(note);
              fn(note);
              expect(note.position).to.equal('1.1.45');
            });
          });
        });
      });
    });
  });

  describe('notes(bar, beat, tick)', function () {
    describe('when bar is not defined', function () {
      it('should return all notes', function () {
        channel.add(['1.1.01', 'A1']);
        channel.add(['2.3.01', 'A1']);
        var notes = channel.notes();
        expect(notes.length).to.equal(2);
        expect(notes[0].position).to.equal('1.1.01');
        expect(notes[1].position).to.equal('2.3.01');
      });
      describe('when there are no notes', function () {
        it('should return an empty array', function () {
          var notes = channel.notes();
          expect(notes).to.be.a('array');
          expect(notes.length).to.equal(0);
        })
      });
    });
    describe('when bar is defined', function () {
      describe('when beat is not defined', function () {
        it('should return all notes on that bar', function () {
          channel.add(['1.1.01', 'A1']);
          channel.add(['2.3.01', 'A1']);
          var notes = channel.notes(2);
          expect(notes.length).to.equal(1);
          expect(notes[0].position).to.equal('2.3.01');
        });
        describe('when there are no notes on that bar', function () {
          it('should return an empty array', function () {
            channel.add(['1.1.01', 'A1']);
            var notes = channel.notes(2);
            expect(notes).to.be.a('array');
            expect(notes.length).to.equal(0);
          })
        });
      });
      describe('when beat is defined', function () {
        describe('when tick is not defined', function () {
          it('should return all notes on that bar and beat', function () {
            channel.add(['1.1.01', 'A1']);
            channel.add(['2.3.01', 'A1']);
            channel.add(['2.2.01', 'A1']);
            channel.add(['2.3.45', 'A1']);
            channel.add(['2.4.01', 'A1']);
            var notes = channel.notes(2, 3);
            expect(notes.length).to.equal(2);
            expect(notes[0].position).to.equal('2.3.01');
            expect(notes[1].position).to.equal('2.3.45');
          });
          describe('when there are no notes on that bar and beat', function () {
            it('should return an empty array', function () {
              channel.add(['1.1.01', 'A1']);
              channel.add(['2.2.01', 'A1']);
              channel.add(['2.4.01', 'A1']);
              var notes = channel.notes(2, 3);
              expect(notes).to.be.a('array');
              expect(notes.length).to.equal(0);
            })
          });
        });
        describe('when tick is defined', function () {
          it('should return all notes on that bar, beat and tick', function () {
            channel.add(['1.1.01', 'A1']);
            channel.add(['2.3.01', 'A1']);
            channel.add(['2.2.01', 'A1']);
            channel.add(['2.3.45', 'A1']);
            channel.add(['2.4.01', 'A1']);
            var notes = channel.notes(2, 3, 1);
            expect(notes.length).to.equal(1);
            expect(notes[0].position).to.equal('2.3.01');
          });
          describe('when there are no notes on that bar, beat and tick', function () {
            it('should return an empty array', function () {
              channel.add(['1.1.01', 'A1']);
              channel.add(['2.2.01', 'A1']);
              channel.add(['2.3.45', 'A1']);
              channel.add(['2.4.01', 'A1']);
              var notes = channel.notes(2, 3, 1);
              expect(notes).to.be.a('array');
              expect(notes.length).to.equal(0);
            })
          });
        });
      });
    });
  });

  describe('_onAddExpandedNote(note)', function () {
    it('should add the note to the trie index', function () {
      var note = new Note({ position: '2.1.02', key: 'B5' });
      channel._onAddExpandedNote(note);
      expect(channel._cache[2][1][2].length).to.equal(1);
      expect(channel._cache[2][1][2]).to.contain(note);
      expect(channel._cache[2][1]['*'].length).to.equal(1);
      expect(channel._cache[2][1]['*']).to.contain(note);
      expect(channel._cache[2]['*'].length).to.equal(1);
      expect(channel._cache[2]['*']).to.contain(note);
    });
  });

  describe('_onRemoveExpandedNote(note)', function () {
    it('should remove the note from the trie index', function () {
      var note = new Note({ position: '2.1.02', key: 'B5' });
      channel._onAddExpandedNote(note);
      channel._onRemoveExpandedNote(note);
      expect(channel._cache[2][1][2].length).to.equal(0);
      expect(channel._cache[2][1][2]).not.to.contain(note);
      expect(channel._cache[2][1]['*'].length).to.equal(0);
      expect(channel._cache[2][1]['*']).not.to.contain(note);
      expect(channel._cache[2]['*'].length).to.equal(0);
      expect(channel._cache[2]['*']).not.to.contain(note);
    });
  });

  describe('_onAddRawNote', function () {
    it('should expand the expression and add ghost to expandedNotes', function () {
      var note = new Note({ position: '1.*.02', key: 'B5' });
      channel._onAddRawNote(note);
      expect(channel.expandedNotes.models.length).to.equal(4);
      expect(channel.expandedNotes.models[0].position).to.equal('1.1.02');
      expect(channel.expandedNotes.models[1].position).to.equal('1.2.02');
      expect(channel.expandedNotes.models[2].position).to.equal('1.3.02');
      expect(channel.expandedNotes.models[3].position).to.equal('1.4.02');
    });
    describe('when channel is child of a pattern', function () {
      it('should use the length properties of that pattern when expanding', function () {
        var note = new Note({ position: '*.*.02', key: 'B5' });
        channel.collection = {
          parent: {
            bars: 2,
            beatsPerBar: 6
          }
        };
        channel._onAddRawNote(note);
        expect(channel.expandedNotes.models.length).to.equal(12);
        expect(channel.expandedNotes.models[0].position).to.equal('1.1.02');
        expect(channel.expandedNotes.models[1].position).to.equal('1.2.02');
        expect(channel.expandedNotes.models[2].position).to.equal('1.3.02');
        expect(channel.expandedNotes.models[3].position).to.equal('1.4.02');
        expect(channel.expandedNotes.models[4].position).to.equal('1.5.02');
        expect(channel.expandedNotes.models[5].position).to.equal('1.6.02');
        expect(channel.expandedNotes.models[6].position).to.equal('2.1.02');
        expect(channel.expandedNotes.models[7].position).to.equal('2.2.02');
        expect(channel.expandedNotes.models[8].position).to.equal('2.3.02');
        expect(channel.expandedNotes.models[9].position).to.equal('2.4.02');
        expect(channel.expandedNotes.models[10].position).to.equal('2.5.02');
        expect(channel.expandedNotes.models[11].position).to.equal('2.6.02');
      });
    });
    describe('when note.position is a plain position', function () {
      it('should use itself as its ghost', function () {
        var note = new Note({ position: '1.1.02', key: 'B5' });
        channel._onAddRawNote(note);
        expect(channel.expandedNotes.models.length).to.equal(1);
        expect(channel.expandedNotes.models[0].position).to.equal('1.1.02');
        expect(channel.expandedNotes.models[0]).to.equal(note);
      });
    });
  });

  describe('_onRemoveRawNote', function () {
    it('should remove all ghost notes in expandedNotes', function () {
      var note = new Note({ position: '1.*.05', key: 'B5' });
      var note2 = new Note({ position: '1.*.02', key: 'C8' });
      channel._onAddRawNote(note);
      channel._onAddRawNote(note2);
      expect(channel.expandedNotes.models.length).to.equal(8);
      channel._onRemoveRawNote(note);
      expect(channel.expandedNotes.models.length).to.equal(4);
      expect(channel.expandedNotes.models[0].position).to.equal('1.1.02');
      expect(channel.expandedNotes.models[1].position).to.equal('1.2.02');
      expect(channel.expandedNotes.models[2].position).to.equal('1.3.02');
      expect(channel.expandedNotes.models[3].position).to.equal('1.4.02');
    });
  });

  describe('_onChangeRawNote', function () {
    it('should remove ghost notes and expand again', function () {
      var note = new Note({ position: '1.*.05', key: 'B5' });
      channel._onAddRawNote(note);
      note.position = '1.*.09';
      channel._onChangeRawNote(note);
      expect(channel.expandedNotes.models.length).to.equal(4);
      expect(channel.expandedNotes.models[0].position).to.equal('1.1.09');
      expect(channel.expandedNotes.models[1].position).to.equal('1.2.09');
      expect(channel.expandedNotes.models[2].position).to.equal('1.3.09');
      expect(channel.expandedNotes.models[3].position).to.equal('1.4.09');
    });
  });

  describe('_start(time, note)', function () {
    it('should trigger "start" event', function () {
      var spy = sinon.spy();
      channel.on('start', spy);
      channel._start(1, {});
      expect(spy).to.have.been.calledOnce;
    });
    describe('when channel is muted', function () {
      it('should not trigger "start" event', function () {
        var spy = sinon.spy();
        channel.on('start', spy);
        channel.mute = true;
        channel._start(1, {});
        expect(spy).not.to.have.been.called;
      });
    });
  });

  describe('_stop(time, note)', function () {
    it('should trigger "stop" event', function () {
      var spy = sinon.spy();
      channel.on('stop', spy);
      channel._stop(1, {});
      expect(spy).to.have.been.calledOnce;
    });
  });
});
