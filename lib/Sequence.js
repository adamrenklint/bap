var PlayableModel = require('./PlayableModel');
var memoize = require('lodash.memoize');

function hashify (grid) {
  var hash = grid.map(function (row) {
    if (Array.isArray(row)) {
      return row.map(function (item) {
        return item.cid;
      }).join('+');
    }
    return row.cid;
  }).join('>');
  return hash;
}

function findFirst (grid) {
  if (Array.isArray(grid) && grid.length) {
    var first = grid[0];
    if (Array.isArray(first)) {
      return first[0];
    }
    return first;
  }
}

function findLongest (row) {
  if (Array.isArray(row)) {
    var longest = 0;
    row.forEach(function (item) {
      if (item.bars > longest) {
        longest = item.bars;
      }
    });
    return longest;
  }
  else {
    return row.bars;
  }
}

function forAll (grid, cb) {
  grid.forEach(function (row) {
    if (Array.isArray(row)) {
      forAll(row, cb);
    }
    else {
      cb(row);
    }
  });
}

var ltRe = /<(\d)+/;
var gtRe = />(\d)+/;

var addOffsets = memoize(function addOffsets (value, offset, nextOffset) {
  var ltMatch, gtMatch;
  if (gtMatch = value.match(gtRe)) {
    offset += parseInt(gtMatch[1], 10);
    value = value.replace(gtRe, '');
  }
  if (ltMatch = value.match(ltRe)) {
    value = value.replace(ltRe, '');
  }
  value += '>' + offset + '<' + (offset + nextOffset + 1);
  return value;
}, function () {
  return [].slice.call(arguments).join('//');
});

var Sequence = PlayableModel.extend({

  type: 'sequence',

  props: {
    loop: ['boolean', true, false],
    sequences: ['grid', true, function () { return []; }]
  },

  dataTypes: {
    grid: {
      set: function (newVal) {
        return {
          val: newVal,
          type: Array.isArray(newVal) ? 'grid' : typeof newVal
        };
      },

      compare: function (currentVal, newVal) {
        var isSame = hashify(currentVal) === hashify(newVal);
        if (!isSame) {
          if (currentVal) {
            forAll(currentVal, function (seq) {
              this.stopListening(seq);
            }.bind(this));
          }

          if (newVal) {
            forAll(newVal, function (seq) {
              this.listenTo(seq, 'change:channels change:sequences', this._forwardChannelChange);
            }.bind(this));
          }
        }
        return isSame;
      }
    }
  },

  derived: {
    tempo: {
      deps: ['sequences'],
      fn: function () {
        var first = findFirst(this.sequences);
        return first && first.tempo || 120;
      }
    },
    bars: {
      deps: ['sequences'],
      fn: function () {
        var total = 0;
        if (this.sequences.length) {
          this.sequences.forEach(function (row) {
            total += findLongest(row);
          });
        }
        return total;
      }
    },
    beatsPerBar: {
      deps: ['sequences'],
      fn: function () {
        var first = findFirst(this.sequences);
        return first && first.beatsPerBar || 4;
      }
    }
  },

  constructor: function () {
    var args = Array.prototype.slice.call(arguments);
    var types = ['sequence', 'pattern'];
    var sequences = [];
    var cont = true;
    var next;

    while (cont && args.length) {
      if (args[0] && ~types.indexOf(args[0].type)) {
        sequences.push([args.shift()]);
      }
      else if (args[0] && Array.isArray(args[0])) {
        sequences.push(args.shift());
      }
      else {
        cont = false;
      }
    }
    
    args[0] = args[0] || {};
    args[0].sequences = sequences;
    PlayableModel.apply(this, args);
  },

  notes: function (returnOriginals) {
    var notes = [];
    var offset = 0;
    function add (sequence, nextOffset) {
      sequence.notes().forEach(function (note) {
        if (returnOriginals) {
          notes.push(note);
        }
        else {
          var clone = note.ghost();
          if (clone.bar) {
            clone.bar += offset;
          }
          else {
            var parts = clone.position.split('.');
            parts[0] = addOffsets(parts[0], offset, nextOffset);
            clone.position = parts.join('.');
          }
          notes.push(clone);
        }
      });
    }
    this.sequences.forEach(function (row) {
      var nextOffset = 0;
      if (Array.isArray(row)) {
        nextOffset = findLongest(row);
        row.forEach(function (item) {
          add(item, nextOffset);
        });
        offset += nextOffset;
      }
      else {
        nextOffset = row.bars;
        add(row, nextOffset);
        offset += nextOffset;
      }
    });
    return notes;
  },

  tempoChanges: function () {
    var changes = [];
    var offset = 0;
    var lastTempo = null;
    var lastBeatsPerBar = null;

    function getPosition () {
      if (offset === 0) {
        return '1.1.01';
      }
      else {
        return [offset, lastBeatsPerBar, '96'].join('.');
      }
    }

    this.sequences.forEach(function (row) {
      if (Array.isArray(row)) {
        row = row[0];
      }
      if (row.tempo !== lastTempo) {
        changes.push([getPosition(), { val: row.tempo }]);
        lastTempo = row.tempo;
      }
      lastBeatsPerBar = row.beatsPerBar;
      offset += row.bars;
    });

    changes.push([[offset, lastBeatsPerBar, 96].join('.'), changes[0][1]]);
    return changes;
  },

  _forwardChannelChange: function () {
    this.trigger('change:sequences');
  }
});

module.exports = Sequence;
