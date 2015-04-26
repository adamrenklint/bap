var Sample = require('../Sample');

module.exports = {

  _sampleConstructor: Sample,

  _initSampleShortcut: function () {
    this._originalLayerFunction = this.layer;
    this.layer = this._overloadedLayerFn;
  },

  _overloadedLayerFn: function (src, params) {
    if (typeof src === 'string') {
      params = params || {};
      params.src = src;
      var sample = new this._sampleConstructor(params);
      this.layers.add(sample);
      return sample;
    }
    return this._originalLayerFunction.apply(this, arguments);
  }
};
