var pmx = require('pmx');
var fs  = require('fs');
var path = require('path');
var cpu = require('./lib/cpu.js');
//var drive = require('./lib/drive.js');
var mem = require('./lib/mem.js');
//var os = require('./lib/os.js');
//var users = require('./lib/users.js');
//var netstat = require('./lib/netstat.js');
  
const config = require('../../config/config.json'); 
pmx.initModule({

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
      actions : false,
      cpu     : false,
      mem     : false,
      issues  : true,
      meta    : true,

      // Custom metrics to put in BIG
      main_probes : [ 'CPU Usage', 
                      'Free Memory'
                    ]
    }

  }

}, function(err, conf) {

    cpu.init(+config.pm2.serverMonit.interval);
//    os.init();
//    drive.init(config.pm2.serverMonit.drive, +config.pm2.serverMonit.interval);
//    users.init(+config.pm2.serverMonit.interval);
    mem.init(+config.pm2.serverMonit.interval);
//    netstat.init(+config.pm2.serverMonit.interval);
//    proc.init(+config.pm2.serverMonit.interval);

});