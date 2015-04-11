function primitive (type) {
  return function (o, name) {
    if (!o || typeof o !== type) {
      throw new Error('Invalid argument: ' + name + ' is not a valid ' + type)
    }
  }
}

exports.number = primitive('number');
