var chai = require('chai');
var expect = chai.expect;
var Note = require('../../lib/Note');

var note;

before(function () {
  note = new Note();
});

describe('Note', function () {

  describe('fromRaw(raw)', function () {
    var tests = [
      [['1.2.04'], { 'position': '1.2.04', 'bar': 1, 'beat': 2, 'tick': 4 }],
      [['1.2.04', { 'duration': 10 }], { 'position': '1.2.04', 'duration': 10, 'bar': 1, 'beat': 2, 'tick': 4 }],
      [['1.2.04', 'A02', { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 10 }],
      [['1.2.04', 'A02', 45, { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 45 }],
      [['1.2.04', 'A02', null, 50, { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 10, 'volume': 50 }],
      [['1.2.04', 'A02', null, 50, -50, { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 10, 'volume': 50, 'pitch': -50 }],
      [['1.2.04', 'A02', null, 50, -50, -25, { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 10, 'volume': 50, 'pitch': -50, 'pan': -25 }],
      [['1.2.04', 'A02', null, 50, -50, -25, 20, { 'duration': 10 }], { 'position': '1.2.04', 'key': 'A02', 'duration': 10, 'volume': 50, 'pitch': -50, 'pan': -25 }]
    ];

    tests.forEach(function (test) {
      var raw = test[0];
      var expected = test[1];
      it('should parse ' + JSON.stringify(raw) + ' correctly', function () {
        var note = Note.fromRaw(raw);
        Object.keys(expected).forEach(function (key) {
          expect(note[key]).to.equal(expected[key]);
        });
      });
    });
  });
});
