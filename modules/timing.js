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

var timerActivate = {};
var timerHandler = (now, timing, id) => {
    // remove from struct of timing 
    var active = (trigger) => {
        eventsHandle.InvokeEvent(timing.trigger, (err) => {
            if (err)
                logger.write.error("invoke event " + timing.trigger + " by trigger of timer timing fail, error ditail: " + err);
            else
                logger.write.info("invoke event " + timing.trigger + " by trigger of timer timing done");

            TimingEventTriggerdChanged(id, timing, err);
            // delete the timing and sent event about it
            // TODO event with detail about id success and about new struct of timing
        })
    };

    if (id in timerActivate)
        return;

    timerActivate[id] = {
        duration: timing.durationInMinuts,
        trigger: timing.trigger,
        last_minut: ""
    };

    // add to struct of current 
    timerActivate[id].interval = setInterval((iid) => {
        if (timerActivate[iid].last_minut == new Date().getMinutes())
            return;

        timerActivate[iid].last_minut = new Date().getMinutes();
        timerActivate[iid].duration--;
        if (timerActivate[iid].duration <= 0) {
            logger.write.info("timing timer id " + iid + " activate");
            active(timerActivate[iid].trigger);
            clearInterval(timerActivate[iid].interval);
            delete timings[iid];
            delete timerActivate[iid];
            SaveToDB();
            TimingStructChanged();
            return;
        }
    }, 50000, id) //60000
    // run with interval of 1 minut and subtract until you get 0, then active and remove
};

logger.write.info("Start interval of timings");
// base interval of timing
var lastMinuue;
setInterval(() => {

    var now = new Date();

    if (lastMinuue == now.getMinutes())
        return;
    lastMinuue = now.getMinutes();

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

    if (timing.timingType == 'timer')
        timing.startTime = new Date();
    timings[shortid.generate()] = timing;
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