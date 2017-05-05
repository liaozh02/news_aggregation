
var pmx = require('pmx'),
    exec = require('child_process').exec,
    redis = require('redis'),
    metricsMod = require('./metrics.js');

//Module entryPoint
pmx.initModule({
  pid: pmx.resolvePidPaths(['var/run/redis-6379.pid']),
  // Options related to the display style on Keymetrics
  widget : {

    // Logo displayed
    logo : 'https://app.keymetrics.io/img/logo/keymetrics-300.png',

    // Module colors
    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme            : ['#141A1F', '#222222', '#3ff', '#3ff'],

    // Section to show / hide
    el : {
      probes  : true,
      actions : true
    },

    // Main block to show / hide
    block : {
      actions : true,
      cpu     : true,
      mem     : true,
      issues  : true,
      meta    : true,

      // Custom metrics to put in BIG
      main_probes : ['Total Keys', 'cmd/sec', 'hits/sec', 'miss/sec']
    }

  }

}, function(err, conf) {

  /**
   * Module specifics like connecting to a database and
   * displaying some metrics
   */
    const config = require('../../config/config.json'); 

    //constrct metrics
    var metrics = new metricsMod();
    //init Metrics
    metrics.initMetrics();

    client = redis.createClient();
    //Start worker whtn client is connected
    client.on("ready", function(){
        
        //set general redis metrics
        console.log(client.server_info.tcp_port)
        metrics.probes.redisTcp.set(client.server_info.tcp_port);
        console.log(client.server_info.process_id)
        metrics.probes.redisProcId.set(client.server_info.process_id);
        console.log(client.server_info.redis_version)
        metrics.probes.redisVersion.set(client.server_info.redis_version);
    })

    //start worker
    metrics.updateMetrics();

    pmx.action('restart', function(reply) {
      exec('/etc/init.d/redis_6379 restart', function (err, out, error) {
        return err ? reply(err) : reply(out);
      });
    });

    pmx.action('backup', function(reply) {
    exec('redis-cli bgsave', function (err, out, error) {
      return err ? reply(err) : reply(out);
    });
  });

});
