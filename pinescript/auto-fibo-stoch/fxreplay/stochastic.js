//@version=1
// Stochastic (9, 3, 3) - FXReplay Version

init = () => {
  indicator({ onMainPanel: false, format: 'price', precision: 2 });
  input.int('%K Length', 9, 'periodK');
  input.int('%K Smoothing', 3, 'smoothK');
  input.int('%D Smoothing', 3, 'periodD');
  band.line('Upper Band', 80, '#787B86', 2, 1);
  band.line('Middle Band', 50, 'rgba(120,123,134,0.5)', 2, 1);
  band.line('Lower Band', 20, '#787B86', 2, 1);
};

var highArr = [];
var lowArr = [];
var closeArr = [];
var MAX = 300;

onTick = (length, _moment, _, ta, inputs) => {
  var h = high(0);
  var l = low(0);
  var c = closeC(0);
  if (isNaN(h) || isNaN(l) || isNaN(c)) return;

  highArr.push(h);
  lowArr.push(l);
  closeArr.push(c);
  if (highArr.length > MAX) { highArr.shift(); lowArr.shift(); closeArr.shift(); }

  var minLen = inputs.periodK + Math.max(inputs.smoothK, inputs.periodD);
  if (closeArr.length < minLen) return;

  var result = ta.stoch(highArr, lowArr, closeArr, inputs.periodK, inputs.periodD, inputs.smoothK);
  var k = result.line.at(-1);
  var d = result.signal.at(-1);
  if (isNaN(k) || isNaN(d)) return;

  plot.line('%K', k, '#FFEB3B', 0);
  plot.line('%D', d, '#FF9800', 0);
};
