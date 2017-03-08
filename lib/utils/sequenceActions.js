module.exports = {

  then: function (base, rest) {
    rest = [].slice.call(rest);
    return [base].concat(rest).map(row => {
      if (!Array.isArray(row)) {
        row = [row];
      }
      return row;
    });
  },

  after: function (base, rest) {
    rest = [].slice.call(rest);
    return rest.concat(base).map(row => {
      if (!Array.isArray(row)) {
        row = [row];
      }
      return row;
    });
  },

  and: function (base, rest) {
    rest = [].slice.call(rest);
    const sequences = [base];
    function add (sequence) {
      if (!~sequences.indexOf(sequence)) {
        sequences.push(sequence);
      }
    }
    rest.forEach(candidate => {
      if (Array.isArray(candidate)) {
        candidate.forEach(add);
      }
      else {
        add(candidate);
      }
    });
    return [sequences];
  }
};
