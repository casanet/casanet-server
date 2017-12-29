fs = require('fs')
const log4js = require('log4js');
const log_file_name = 'logs/prog_log.log';
const security_file_name = 'logs/security_log.log';

log4js.configure({
    appenders: {
        prog_log: {
            type: 'file',
            filename: log_file_name
        },
        console_log: {
            type: 'console',
        },
        security_log: {
            type: 'file',
            filename: security_file_name
        }
    },
    categories: {
        default: {
            appenders: ['prog_log', 'console_log'],
            level: 'debug'
        },
        security_category: {
            appenders: [ 'security_log'],
            level: 'debug'
        }
    }
});

var GetLastLogs = (isSecurity , lines, callback) => {
    fs.readFile(isSecurity ?security_file_name : log_file_name, 'utf8', function (err, data) {
        if (err) {
            callback([], err);
            return;
        }
        var l = data.split(/\r\n|\r|\n/).length;
        arrayOfLines = data.match(/[^\r\n]+/g);
        arrayOfLines.reverse()
        arrayOfResult = [];
        arrayOfLines.forEach((line, index) => {
            if (lines > index) {
                var linedata = {
                    time: new Date(line.substring(1, 11) + " " + line.substring(12, 20)),
                    level: line.split('[')[2].split(']')[0],
                    message: line.split(isSecurity ? "security_category - " : "default - ")[1]
                };
                arrayOfResult.push(linedata);
            }
        });

        callback(arrayOfResult);
    });
}

module.exports = {
    write: log4js.getLogger(),
    security: log4js.getLogger('security_category'),
    read: GetLastLogs
};
