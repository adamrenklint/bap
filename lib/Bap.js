var Model = require('./Model');
var Clock = require('./Clock');
var LoadingState = require('./LoadingState');

var Bap = Model.extend({

  type: 'bap',

  children: {
    clock: Clock,
    loadingState: LoadingState
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.vent.bap = this;
    this.on('change:loadingState.loading', this._onChangeLoadingState);
  },

  _onChangeLoadingState: function () {
    this.vent.loading = this.loadingState.loading;
  }
});

var constructors = {
  'Kit': require('./Kit'),
  'Slot': require('./Slot'),
  'Layer': require('./Layer'),
  'Pattern': require('./Pattern'),
  'Sequence': require('./Sequence'),
  'Channel': require('./Channel'),
  'Note': require('./Note'),
  'Oscillator': require('./Oscillator'),
  'Sample': require('./Sample')
};

Object.keys(constructors).forEach(function (name) {
  var Ctor = constructors[name];
  if (typeof Ctor === 'function') {
    Bap.prototype[name] = Ctor;
    Bap.prototype[name.toLowerCase()] = function (a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z) {
      return new Ctor(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z);
    };
  }
});

module.exports = Bap;
