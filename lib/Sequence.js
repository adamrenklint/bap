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
  var longest = 0;
  row.forEach(function (item) {
    if (item.bars > longest) {
      longest = item.bars;
    }
  });
  return longest;
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
    var cids = [];
    var offset = 0;
    function add (sequence, length) {
      sequence.notes().forEach(function (note) {
        if (returnOriginals) {
          if (cids.indexOf(note.cid) < 0) {
            notes.push(note);
            cids.push(note.cid);
          }
        }
        else {
          var clone = note.ghost();
          if (clone.bar) {
            clone.bar += offset;
          }
          else {
            var parts = clone.position.split('.');
            parts[0] = Sequence.addOffsetToExpression(parts[0], offset, length);
            clone.position = parts.join('.');
          }
          notes.push(clone);
        }
      });
    }
    this.sequences.forEach(function (row) {
      var longestInRow = findLongest(row);
      row.forEach(function (item) {
        add(item, longestInRow);
      });
      offset += longestInRow;
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

var ltRe = /<(\d)+/;
var gtRe = />(\d)+/;

Sequence.addOffsetToExpression = memoize(function (value, offset, length) {
  var gtMatch, ltMatch;
  if (gtMatch = value.match(gtRe)) {
    gtMatch = parseInt(gtMatch[1], 10) + offset;
    value = value.replace(gtRe, '');
  }
  else {
    gtMatch = offset;
  }
  if (ltMatch = value.match(ltRe)) {
    value = value.replace(ltRe, '');
    ltMatch = parseInt(ltMatch[1], 10) + offset;
  }
  else {
    ltMatch = offset + length + 1;
  }
  return value += '>' + gtMatch + '<' + ltMatch;
}, function () {
  return [].slice.call(arguments).join('//');
});

module.exports = Sequence;
