function overloadedAccessor (name, Ctor) {

  var mixin = {};

  mixin[name] = function (id, model) {

    var chained = false;
    var collection = this[name + 's'];
    if (!model && id instanceof Ctor) {
      model = id;
      model.id = collection.nextId();
      chained = true;
    }
    else if (typeof id === 'number' && !model) {
      model = collection.get(id) || new Ctor({ id: id });
    }
    else if (id && model instanceof Ctor) {
      collection.remove(collection.get(id));
      model.id = id;
      chained = true;
    }
    else {
      model = new Ctor({ id: collection.nextId() });
    }

    model = collection.add(model);
    return chained ? this : model;
  };

  return mixin;
}

module.exports = overloadedAccessor;
