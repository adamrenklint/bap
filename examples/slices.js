var bap = require('../index');

function slices () {
  var kit = bap.kit();
  var base = bap.sample({
    src: 'sounds/slices.wav',
    attack: 0.005,
    release: 0.005
  });
  kit.slot(1).layer(base.with({
    offset: 0.072,
    length: 0.719
  }));
  kit.slot(2).layer(base.with({
    offset: 0.9,
    length: 0.750
  }));
  kit.slot(3).layer(base.with({
    offset: 1.68,
    length: 0.690
  }));
  kit.slot(4).layer(base.with({
    offset: 9.49,
    length: 2
  }));

  var pattern = bap.pattern({ bars: 2 });
  pattern.channel(1).add(
    ['1.1.01', 'A1'],
    ['1.3.01', 'A2'],
    ['2.1.01', 'A3'],
    ['2.3.01', 'A4', 96 * 2]
  );

  pattern.use('A', kit).start();
}

module.exports = slices;
