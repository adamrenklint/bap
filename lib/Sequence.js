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
  // props: {
  //   bars: ['positiveNumber', true, 1],
  //   beatsPerBar: ['positiveNumber', true, 4],
  //   tempo: ['positiveNumber', true, 120]
  // },
  //
  // dataTypes: {
  //   positiveNumber: numberInRangeType('positiveNumber', 1, Infinity)
  // },

  initialize: function (sequences, options) {
    if (Array.isArray(sequences)) {
      this.sequences = sequences;
      sequences = null;
    }
    PlayableModel.prototype.initialize.call(this, sequences, options);
  //   this.listenTo(this.channels, 'start', this.kits.start.bind(this.kits));
  //   this.listenTo(this.channels, 'stop', this.kits.stop.bind(this.kits));
  },

  notes: function () {
    var notes = [];
    var offset = 0;
    function add (sequence) {
      sequence.notes().forEach(function (note) {
        var clone = note.ghost();
        clone.bar += offset;
        notes.push(clone);
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
    // debugger;
    return notes;
  },
  //
  // kit: function (id, kit) {
  //   if (kit) {
  //     this.kits[id] = kit;
  //     return this;
  //   }
  //   else if (id) {
  //     return this.kits[id];
  //   }
  // }

});

module.exports = Sequence;
