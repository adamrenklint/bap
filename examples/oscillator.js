var bap = require('../index');

function oscillator () {

  var kit = bap.kit();
  var CustomOscillator = bap.Oscillator.extend({
    _source: function (params) {
      // This is just a naive re-implementation of the existing
      // bap.Oscillator node to demonstrate that you can use any kind of
      // oscillator node, or other node, inside the _source method
      var oscillator = this.context.createOscillator();
      oscillator.frequency.value = params.frequency || 0;
      oscillator.type = 'triangle';
      return oscillator;
    }
  })
  const customOscillator = new CustomOscillator()

  kit.slot('Q').layer(customOscillator.with({ frequency: 330 }));
  kit.slot('W').layer(customOscillator.with({ frequency: 440 }));

  var pattern = bap.pattern({ bars: 2, tempo: 120 });
  pattern.channel(1).add(
    ['*.1.01',   '1Q', 48],
    ['*.2%1.01', '1W', 48]
  );

  bap.clock.sequence = pattern.kit(kit);
}

module.exports = oscillator;
