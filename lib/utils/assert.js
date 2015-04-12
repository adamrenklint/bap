function primitive (type) {
  return function (o, name) {
    if (!o || typeof o !== type) {
      throw new Error('Invalid argument: ' + (name || o) + ' is not a valid ' + type);
    }
  };
}

exports.number = primitive('number');

exports.notNegativeNumber = function (o, name) {
  exports.number(o, name);
  if (o < 0) {
    throw new Error('Invalid argument: ' + (name || o) + ' is a negative number');
  }
};

exports.positiveNumber = function (o, name) {
  exports.number(o, name);
  if (o < 1) {
    throw new Error('Invalid argument: ' + (name || o) + ' is not a positive number');
  }
};

exports.notNull = function (o) {
  if (!o) {
    throw new Error('Invalid argument: ' + o + ' is null or undefined');
  }
};
