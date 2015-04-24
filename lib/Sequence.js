var PlayableModel = require('./PlayableModel');

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
    first = grid[0];
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
        return hashify(currentVal) === hashify(newVal);
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

  constructor: function (sequences, params, options) {
    if (Array.isArray(sequences)) {
      params = params || {};
      params.sequences = sequences;
    }
    else {
      options = params;
      params = sequences;
    }

    PlayableModel.call(this, params, options);
  },

  notes: function (returnOriginals) {
    var notes = [];
    var offset = 0;
    function add (sequence) {
      sequence.notes().forEach(function (note) {
        if (returnOriginals) {
          notes.push(note);
        }
        else {
          var clone = note.ghost();
          clone.bar += offset;
          notes.push(clone);
        }
      });
    }
    this.sequences.forEach(function (row, rowIndex) {
      if (Array.isArray(row)) {
        row.forEach(function (item) {
          add(item);
        });
        offset += findLongest(row);
      }
      else {
        add(row);
        offset += row.bars;
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
  }
});

module.exports = Sequence;
