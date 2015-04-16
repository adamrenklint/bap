var counts = {};

function uniqueId (prefix) {
  counts[prefix] = counts[prefix] || 0;
  return prefix + '-' + (++counts[prefix]);
}

module.exports = uniqueId;
