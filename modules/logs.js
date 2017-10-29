var fs = require('fs')

module.exports = {
    AppendEvent: function (eventName, eventData) {

        dataToLog = '\n\n' + new Date().toLocaleString() + '\n';
        dataToLog += eventName + ':\n';
        dataToLog += eventData;

        fs.appendFile('./DB/logs.log', dataToLog, function (err) {
            if (err)
                console.log('Error log writing');
            console.log('Loggs Saved');
        });
    }
}
