/// Extend Date object
(function () {
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    Date.prototype.getDayName = function () {
        return days[this.getDay()];
    };
})();


// Logger
var logger = require('./logs');

var fs = require('fs')
var shortid = require('shortid');

var eventsHandle = require('./events');

var updateChangesCallbacks = [];
var updateEventsCallbacks = [];

var timings;
try {
    timings = require('../DB/timing.json');
} catch (error) {
    logger.write.warn("Error while reading timing.json file")
    timings = {}
}

var SaveToDB = () => {
    fs.writeFile('./DB/timing.json', JSON.stringify(timings, null, '\t'), 'utf-8', function (err) {
        if (err)
            logger.write.error('Error to write timing file');
        else
            logger.write.debug('Done to update timing file');
    })
}


// run with new thread and invoke every event that nedded

var dailyHandler = (now, timing, id) => {

    var minuts = timing.time.split(":")[1];
    var hour = timing.time.split(":")[0];

    minuts = parseInt(minuts);
    hour = parseInt(hour);

    if (minuts != now.getMinutes() ||
        hour != now.getHours() ||
        timing.days.indexOf(now.getDayName()) == -1)
        return;

    logger.write.info("timing daily id " + id + " activate");

    eventsHandle.InvokeEvent(timing.trigger, (err) => {
        if (err)
            logger.write.error("invoke event " + timing.trigger + " by trigger of daily timing fail, error ditail: " + err);
        else
            logger.write.info("invoke event " + timing.trigger + " by trigger of daily timing done");

        TimingEventTriggerdChanged(id, timing, err);
    })
};

var onceHandler = (now, timing, id) => {
    var timingDate = new Date("20" + timing.date.split("-")[2] + "-" +
        timing.date.split("-")[1] + "-" +
        timing.date.split("-")[0] + " " +
        timing.time +
        ":00")

    now.setMilliseconds(0);
    now.setSeconds(0);

    if (now.getTime() != timingDate.getTime())
        return;

    //delete timings[id];
    //SaveToDB();
    //TimingStructChanged();

    logger.write.info("timing once id " + id + " activate");

    eventsHandle.InvokeEvent(timing.trigger, (err) => {
        if (err)
            logger.write.error("invoke event " + timing.trigger + " by trigger of once timing fail, error ditail: " + err);
        else
            logger.write.info("invoke event " + timing.trigger + " by trigger of once timing done");

        TimingEventTriggerdChanged(id, timing, err);
    })

};

// hold every timer interval to know when invoke it
var timerActivate = {};

var timerHandler = (now, timing, id) => {

    // if id already in system, return
    if (id in timerActivate)
        return;
    timerActivate[id] = true;

    setTimeout((timerID, timing) => {
        
        // if time stil on and not removed
        if (timerID in timings) {
            logger.write.info("timing timer id " + timerID + " activate");

            eventsHandle.InvokeEvent(timing.trigger, (err) => {
                if (err)
                    logger.write.error("invoke event " + timing.trigger + " by trigger of timer timing fail, error ditail: " + err);
                else
                    logger.write.info("invoke event " + timing.trigger + " by trigger of timer timing done");

                TimingEventTriggerdChanged(timerID, timing, err);
                // delete the timing and sent event about it
                // TODO event with detail about id success and about new struct of timing
            })
        }

        delete timings[timerID];
        delete timerActivate[timerID];
        SaveToDB();
        TimingStructChanged();
    }, timing.durationInMinuts * 60000, id, timing);
};

logger.write.info("Start interval of timings");
// base interval of timing
var lastMinute;
setInterval(() => {

    var now = new Date();

    if (lastMinute == now.getMinutes())
        return;
    lastMinute = now.getMinutes();

    Object.keys(timings).forEach((id) => {

        if (timings[id].active != 'on')
            return;

        switch (timings[id].timingType) {
            case "daily":
                dailyHandler(now, timings[id], id);
                break;
            case "once":
                onceHandler(now, timings[id], id);
                break;
            case "timer":
                timerHandler(now, timings[id], id);
                break;
            default:
                logger.write.warn("type -" + timings[id].timingType + "- in timing id " + id + " is invalid")
                break;
        }
    });

}, 20000);

// API

var TimingValidation = (timing) => {

    var hasError = false;
    try {
        switch (timing.timingType) {
            case "daily":
                timing.days.forEach(() => { });
                if (!timing.time || !timing.trigger)
                    hasError = true;
                break;
            case "once":
                if (!timing.time || !timing.date || !timing.trigger)
                    hasError = true;
                break;
            case "timer":
                if (!parseInt(timing.durationInMinuts) || !timing.trigger)
                    hasError = true;
                break;
            default:
                hasError = true;
                break;
        }
    } catch (error) {
        hasError = true;
    }
    return !hasError;
};

var GetTimings = (next) => {
    next(timings);
}

var CreateTiming = (timing, next) => {

    var newID = shortid.generate();
    timings[newID] = timing;
    if (timing.timingType == 'timer') {
        timings[newID].startTime = new Date();
        timerHandler(new Date(), timings[newID], newID);
    }

    SaveToDB();
    TimingStructChanged();
    next();
}

var EditTiming = (id, timing, next) => {
    timings[id] = timing;
    SaveToDB();
    TimingStructChanged();
    next();
}

var DeleteTiming = (id, next) => {
    delete timings[id];
    SaveToDB();
    TimingStructChanged();

    next();
}

var TimingStructChanged = () => {
    updateChangesCallbacks.forEach((callback) => {
        callback(timings);
    })
}

var TimingEventTriggerdChanged = (id, timing, err) => {
    updateEventsCallbacks.forEach((callback) => {
        callback(id, timing, err);
    })
}

// Let registar to change state event
var UpdateChangesTimingsRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

var UpdateTimingEventsRegistar = (callback) => {
    updateEventsCallbacks.push(callback);
};

module.exports = {
    TimingValidation: TimingValidation,
    GetTimings: GetTimings,
    CreateTiming: CreateTiming,
    EditTiming: EditTiming,
    DeleteTiming: DeleteTiming,
    UpdateChangesTimingsRegistar, UpdateChangesTimingsRegistar,
    UpdateTimingEventsRegistar, UpdateTimingEventsRegistar
}