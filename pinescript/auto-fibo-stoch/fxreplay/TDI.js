//@version=1
// TDI - Traders Dynamic Index [Goldminds] - FXReplay Version

init = () => {
  indicator({ onMainPanel: false, format: 'inherit' });
  input.int('RSI Period', 13, 'rsiPeriod');
  input.int('Band Length', 31, 'bandLength');
  input.int('Fast MA on RSI', 1, 'fastLen');
  input.int('Slow MA on RSI', 9, 'slowLen');
  band.line('Extremely Oversold', 20, 'rgba(128,128,128,0.4)', 2, 1);
  band.line('Oversold', 30, 'rgba(128,128,128,0.4)', 2, 1);
  band.line('Midline', 50, 'rgba(128,128,128,0.6)', 0, 1);
  band.line('Overbought', 70, 'rgba(128,128,128,0.4)', 2, 1);
  band.line('Extremely Overbought', 80, 'rgba(128,128,128,0.4)', 2, 1);
};

var closeArr = [];
var MAX = 300;

onTick = (length, _moment, _, ta, inputs) => {
  var c = closeC(0);
  if (isNaN(c)) return;

  closeArr.push(c);
  if (closeArr.length > MAX) closeArr.shift();

  var minLen = inputs.rsiPeriod + inputs.bandLength + Math.max(inputs.fastLen, inputs.slowLen);
  if (closeArr.length < minLen) return;

  var rsiSeries = ta.rsi(closeArr, inputs.rsiPeriod);
  var maSeries = ta.sma(rsiSeries, inputs.bandLength);
  var sdSeries = ta.stdev(rsiSeries, inputs.bandLength);
  var fastMASeries = ta.sma(rsiSeries, inputs.fastLen);
  var slowMASeries = ta.sma(rsiSeries, inputs.slowLen);

  var ma = maSeries.at(-1);
  var sd = sdSeries.at(-1);
  var fast = fastMASeries.at(-1);
  var slow = slowMASeries.at(-1);
  if (isNaN(ma) || isNaN(sd) || isNaN(fast) || isNaN(slow)) return;

  var offs = 1.6185 * sd;
  var upper = ma + offs;
  var lower = ma - offs;
  var mid = (upper + lower) / 2;

  plot.line('Upper Band', upper, '#2962ff', 0, 0, 0, 'upper');
  plot.line('Lower Band', lower, '#2962ff', 0, 0, 0, 'lower');
  plot.line('Middle of Bands', mid, '#f57f17', 0, 0, 0, 'mid');
  plot.line('Slow MA', slow, '#008000', 0, 0, 0, 'slow');
  plot.line('Fast MA', fast, '#ab0506', 0, 0, 0, 'fast');
};
