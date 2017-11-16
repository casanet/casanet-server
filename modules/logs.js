const log4js = require('log4js');
log4js.configure({
    appenders: {
        prog_log: {
            type: 'file',
            filename: 'prog_log.log'
        },
        console_log: {
            type: 'console',
        }
    },
    categories: {
        default: {
            appenders: ['prog_log', 'console_log'],
            level: 'debug'
        }
    }
});

module.exports =  log4js.getLogger('prog_log');
