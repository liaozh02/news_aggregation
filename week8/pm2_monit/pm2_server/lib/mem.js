var pmx     = require('pmx');
var os = require('os');
var cp = require('child_process');

var Probe = pmx.probe();
var metrics = {};

function refreshMetrics() {

cp.exec('cat /proc/meminfo | head -5', { shell:true }, function(err, out) {
var total_mem;
var free_mem;
if (err || !out) {
    total_mem = os.totalmem() / 1024;
    free_mem = os.freemem() / 1024;
} else {
    var result_memory = (out.match(/\d+/g));
    total_mem = result_memory[0];
    free_mem = parseInt(result_memory[1]) + (parseInt(result_memory[3]) + parseInt(result_memory[4]));
}

var total_mem_gb = (total_mem/1024/1024).toFixed(1) + 'GB';
var used_mem = ((total_mem - free_mem)/1024/1024).toFixed(1) + 'GB';
var result_memory_used = used_mem + ' / ' + total_mem_gb;
var free_mem_pour = (100 * (free_mem / total_mem)).toFixed(1) + '%';

metrics.freeMem.set(free_mem_pour);
metrics.memUsed.set(result_memory_used);
  });
}

function initMetrics() {
  metrics.freeMem = Probe.metric({
    name  : 'Free Memory',
    value : 'N/A',
    alert : {
      mode : 'threshold',
      value : 10,
      cmp : '>'
    }
  });

  metrics.memUsed = Probe.metric({
    name  : 'Used Memory',
    value : 'N/A'
  });
}

function init(interval) {
  initMetrics();
  refreshMetrics();
  setInterval(refreshMetrics.bind(this), interval * 1000);
}

module.exports.init = init;