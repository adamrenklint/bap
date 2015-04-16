var Sample = require('../Sample');

module.exports = {

  initSampleShortCut: function () {
    this.originalLayerFunction = this.layer;
    this.layer = this.overloadedLayerFn;
  },

  overloadedLayerFn: function (src, params) {
    if (typeof src === 'string') {
      params = params || {};
      params.src = src;
      var sample = new Sample(params);
      this.layers.add(sample);
      return sample;
    }
    return this.originalLayerFunction.apply(this, arguments);
  }
};
