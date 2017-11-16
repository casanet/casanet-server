// Logger
var logger = require('./logs');

var fs = require('fs')
var shortid = require('shortid');

var devicesHandle = require('./devices');

var devices = require('../DB/devices.json');
var events;
try {
    events = require('../DB/events.json');
} catch (error) {
    events = {}
}

var SaveToDB = () => {
    fs.writeFile('./DB/events.json', JSON.stringify(events, null, '\t'), 'utf-8', function (err) {
        if (err)
            logger.error('Error to write events file');
        else
            logger.debug('Done to update events file');
    })
}

// check the structer of object if it can be action in event
// return true if ok
var ActionsValidation = (actions) => {

    var hasError = false;
    try {
        actions.forEach((action) => {
            if (!action.deviceID ||
                !action.type ||
                !action.state) {
                hasError = true;
            }
        });
    } catch (error) {
        hasError = true;
    }
    return !hasError;
};

var GetEvents = (next) => {
    next(events);
}

var CreateEvent = (name, actions, next) => {

    events[shortid.generate()] = {
        name: name,
        actions: actions
    }

    SaveToDB();

    next();
}

var EditEvent = (id, name, actions, next) => {
    events[id] = {
        name: name,
        actions: actions
    }

    SaveToDB();

    next();
}

var DeleteEvent = (id, next) => {
    delete events[id];

    SaveToDB();

    next();
}

// Invoke the action action by action by recusion
var RunActionsRecursion = (actions, index, next) => {

    // Stop condition if run on all actions
    if (actions.length <= index) {
        next();
        return;
    }

    // Get current action
    var action = actions[index];

    // If all ok start next recursion call
    var nextAction = (err) => {
        if (err) {
            next(err);
            return;
        }

        RunActionsRecursion(actions, index + 1, next);
    }

    // First set the wanted state
    devicesHandle.SetDeviceProperty(action.deviceID, 'switch', action.state, (err) => {
        if (err) {
            next(err);
            return;
        }

        // Then if it need addtional value set do it 
        if (action.type == 'switch')
            nextAction();
        else
            devicesHandle.SetDeviceProperty(action.deviceID, action.type, action.set, nextAction);
    });
}

// Start invoke event by its id
var InvokeEvent = (id, next) => {
    if (!(id in events)) {
        logger.warn('event id ' + id + ' not exist');
        next('event id not exist');
        return;
    }
    logger.info('Start invoking event id ' + id);
    RunActionsRecursion(events[id].actions, 0, next);
}

module.exports = {
    ActionsValidation: ActionsValidation,
    GetEvents: GetEvents,
    CreateEvent: CreateEvent,
    EditEvent: EditEvent,
    DeleteEvent: DeleteEvent,
    InvokeEvent: InvokeEvent
}