const PlayableModel = require('./PlayableModel');
const PositionModel = require('./PositionModel');
const sequenceActions = require('./utils/sequenceActions');

function hashify (grid) {
  return grid.map(row => row.map(({cid}) => cid).join('+')).join('>');
}

function findFirst (grid) {
  return grid[0] && grid[0][0];
}

function findLongest (row) {
  let longest = 0;
  row.forEach(({bars}) => {
    if (bars > longest) {
      longest = bars;
    }
  });
  return longest;
}

function forAll (grid, cb) {
  grid.forEach(row => {
    if (Array.isArray(row)) {
      forAll(row, cb);
    }
    else {
      cb(row);
    }
  });
}

const Sequence = PlayableModel.extend({

  type: 'sequence',

  props: {
    loop: ['boolean', true, false],
    sequences: ['sequence-grid', true, () => []]
  },

  dataTypes: {
    'sequence-grid': {
      set: function (newVal) {
        return {
          val: newVal,
          type: Array.isArray(newVal) && Array.isArray(newVal[0]) || !newVal[0] ? 'sequence-grid' : typeof newVal
        };
      },

      compare: function (currentVal, newVal) {
        const isSame = hashify(currentVal) === hashify(newVal);
        if (!isSame) {
          forAll(currentVal, seq => {
            this.stopListening(seq);
          });

          forAll(newVal, seq => {
            this.listenTo(seq, 'change:channels change:sequences', this._forwardChannelChange);
          });
        }
        return isSame;
      }
    }
  },

  derived: {
    tempo: {
      deps: ['sequences'],
      fn: function () {
        const first = findFirst(this.sequences);
        return first && first.tempo || 120;
      }
    },
    bars: {
      deps: ['sequences'],
      fn: function () {
        let total = 0;
        if (this.sequences.length) {
          this.sequences.forEach(row => {
            total += findLongest(row);
          });
        }
        return total;
      }
    },
    beatsPerBar: {
      deps: ['sequences'],
      fn: function () {
        const first = findFirst(this.sequences);
        return first && first.beatsPerBar || 4;
      }
    }
  },

  constructor: function () {
    const args = Array.prototype.slice.call(arguments);
    const types = ['sequence', 'pattern'];
    const sequences = [];
    let cont = true;
    let next;

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
    if (sequences.length) {
      args[0].sequences = sequences;
    }
    PlayableModel.apply(this, args);
  },

  initialize: function () {
    PlayableModel.prototype.initialize.apply(this, arguments);
    this.cacheMethodUntilEvent('notes', 'change:sequences');
    this.cacheMethodUntilEvent('patterns', 'change:sequences');
    this.cacheMethodUntilEvent('tempoAt', 'change:sequences');
  },

  notes: function (bar, beat, tick) {
    const notes = {};
    if (bar < 1 || bar > this.bars) throw new Error('Invalid argument: bar is not within sequence length');

    notes[bar] = [];
    const patternsForBar = this.patterns(bar);

    const cid = this.cid;
    Object.keys(patternsForBar).forEach(offset => {
      const patterns = patternsForBar[offset];
      const innerBar = bar - parseInt(offset, 10);
      patterns.forEach(pattern => {
        notes[bar] = notes[bar].concat(pattern.notes(innerBar, beat, tick));
      });
    });

    return notes;
  },

  patterns: function (bar, outerOffset) {
    if (typeof bar !== 'number') throw new Error('Invalid argument: bar is not a number');
    if (bar < 1 || bar > this.bars) throw new Error('Invalid argument: bar is not within sequence length');
    const patterns = {};
    let sequences = this.sequences.slice();
    let offset = 0;
    outerOffset = outerOffset || 0;
    let next, longest, start, end;

    while (sequences.length) {
      next = sequences.shift();
      longest = findLongest(next);
      start = offset + 1;
      end = offset + longest;
      if (bar >= start && bar <= end) {
        sequences = [];
      }
      else {
        offset += longest;
      }
    }

    const cid = this.cid;
    next.forEach(seq => {
      const innerOffset = offset + outerOffset;
      if (seq.type === 'sequence') {
        const nestedPatternList = seq.patterns(bar - offset, innerOffset);
        Object.keys(nestedPatternList).forEach(nestedOffset => {
          const nestedPatterns = nestedPatternList[nestedOffset];
          patterns[nestedOffset] = (patterns[nestedOffset] || []).concat(nestedPatterns);
        });
      }
      else {
        patterns[innerOffset] = patterns[innerOffset] || [];
        patterns[innerOffset].push(seq);
      }
    });

    return patterns;
  },

  tempoAt: function (bar) {
    const tempoChanges = this.tempoChanges();
    const validChanges = tempoChanges.filter(change => change[0] <= bar);
    return validChanges.length ? validChanges[validChanges.length - 1][1] : 120;
  },

  tempoChanges: function () {
    const changes = [];
    let bar = 1;
    let lastTempo = null;

    this.sequences.forEach(row => {
      row = row[0];
      if (row.tempo !== lastTempo) {
        changes.push([bar, row.tempo, row.beatsPerBar]);
        lastTempo = row.tempo;
      }
      bar += row.bars;
    });

    return changes;
  },

  then: function () {
    const sequences = sequenceActions.then(this, arguments);
    return new this.constructor({ sequences: sequences });
  },

  after: function () {
    const sequences = sequenceActions.after(this, arguments);
    return new this.constructor({ sequences: sequences });
  },

  and: function () {
    const sequences = sequenceActions.and(this, arguments);
    return new this.constructor({ sequences: sequences });
  },

  _forwardChannelChange: function () {
    this.trigger('change:sequences');
  }
});

module.exports = Sequence;
