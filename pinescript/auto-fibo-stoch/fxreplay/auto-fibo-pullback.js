//@version=1
// Momentum Candle + EMA - FXReplay Version

init = () => {
  indicator({ onMainPanel: true, format: 'inherit' });
  input.float('Super Body Multiplier', 1.5, 'momMult');
  input.int('Momentum Avg Length', 15, 'momLen');
  input.bool('Volume Filter', true, 'volFilt');
  input.float('Volume Multiplier', 1.0, 'volMult');
  input.int('Volume Avg Length', 20, 'volLen');
  input.int('Fast EMA', 14, 'emaFast');
  input.int('Slow EMA', 60, 'emaSlow');
  input.bool('Show EMA', true, 'showEMA');
};

var closeArr = [];
var bodyArr = [];
var volArr = [];
var MAX = 300;

onTick = (length, _moment, _, ta, inputs) => {
  var h = high(0);
  var l = low(0);
  var c = closeC(0);
  var o = openC(0);
  var v = volume(0);
  if (isNaN(h) || isNaN(l) || isNaN(c) || isNaN(o)) return;

  var body = Math.abs(c - o);
  closeArr.push(c);
  bodyArr.push(body);
  volArr.push(isNaN(v) ? 0 : v);
  if (closeArr.length > MAX) { closeArr.shift(); bodyArr.shift(); volArr.shift(); }

  var len = closeArr.length;

  // -- EMA --
  if (inputs.showEMA && len >= inputs.emaSlow) {
    var efArr = ta.ema(closeArr, inputs.emaFast);
    var esArr = ta.ema(closeArr, inputs.emaSlow);
    var ef = efArr.at(-1);
    var es = esArr.at(-1);
    if (!isNaN(ef) && !isNaN(es)) {
      plot.line('EMA Fast', ef, '#FFEB3B', 0, 0, 0, 'emaFast');
      plot.line('EMA Slow', es, '#FF9800', 0, 0, 0, 'emaSlow');
      var emaDir = ef > es ? 0 : 1;
      plot.filledArea('emaCloud', 'EMA Fast', 'EMA Slow', 'EMA Cloud', 'rgba(150,150,150,0.15)', 85, true, 'plot_plot');
      plot.colorer('EMA Fast Dir', emaDir, 'EMA Fast', [{ name: 'Bull', color: '#FFEB3B' }, { name: 'Bear', color: 'rgba(255,235,59,0.3)' }]);
      plot.colorer('EMA Slow Dir', emaDir, 'EMA Slow', [{ name: 'Bull', color: '#FF9800' }, { name: 'Bear', color: 'rgba(255,152,0,0.3)' }]);
    }
  }

  // -- Momentum Candle --
  if (len < inputs.momLen) return;
  var mAvgArr = ta.sma(bodyArr, inputs.momLen);
  var mAvg = mAvgArr.at(-1);
  if (isNaN(mAvg)) return;

  var volOk = true;
  if (inputs.volFilt && len >= inputs.volLen) {
    var vAvgArr = ta.sma(volArr, inputs.volLen);
    var vAvg = vAvgArr.at(-1);
    volOk = !isNaN(vAvg) && v > vAvg * inputs.volMult;
  }

  var bull = c > o;
  var bear = c < o;
  var supBull = body > mAvg * inputs.momMult && bull && volOk;
  var supBear = body > mAvg * inputs.momMult && bear && volOk;
  var abvBull = body > mAvg && bull && !supBull && volOk;
  var abvBear = body > mAvg && bear && !supBear && volOk;

  if (supBull || supBear || abvBull || abvBear) {
    var momIdx = 1;
    if (supBull) momIdx = 1;
    else if (supBear) momIdx = 2;
    else if (abvBull) momIdx = 3;
    else if (abvBear) momIdx = 4;
    plot.barColorer('Momentum', momIdx, [
      { name: 'Super Bull', color: 'rgba(0,230,64,1)' },
      { name: 'Super Bear', color: 'rgba(255,23,23,1)' },
      { name: 'Above Bull', color: 'rgba(0,230,64,0.5)' },
      { name: 'Above Bear', color: 'rgba(255,23,23,0.5)' }
    ]);
  }
};
