fs = require('fs')
const log4js = require('log4js');
const log_file_name = 'prog_log.log';

log4js.configure({
    appenders: {
        prog_log: {
            type: 'file',
            filename: log_file_name
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

var GetLastLogs = (lines, callback) => {
    fs.readFile(log_file_name, 'utf8', function (err, data) {
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
                    time : new Date(line.substring(1,11) + " " + line.substring(12,20)),
                    level : line.split('[')[2].split(']')[0],
                    message : line.split("prog_log - ")[1]
                };
                arrayOfResult.push(linedata);
            }
        });

        callback(arrayOfResult);
    });
}

module.exports = {
    write: log4js.getLogger('prog_log'),
    read: GetLastLogs
};
