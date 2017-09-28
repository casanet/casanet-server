var fs = require('fs')
var shortid = require('shortid');

var Commons = require('./commons');
var switchers = require('./switchers');
var lights = require('./lights');

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
            console.log('Error to write events file!')
        else
            console.log('Done to update events file!')
    })
}

// check the structer of object if it can be action in event
// return true if ok
var ActionsValidation = (actions) => {

    var hasError = false;
    try {
        actions.forEach((action) => {
            if (!action.mac ||
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

    next(true);
}

var EditEvent = (id, name, actions, next) => {
    events[id] = {
        name: name,
        actions: actions
    }

    SaveToDB();

    next(true);
}

var DeleteEvent = (id, next) => {
    delete events[id];

    SaveToDB();

    next(true);
}

// Invoke the action action by action by recusion
var RunActionsRecursion = (actions, index, next) => {

    // Stop condition if run on all actions
    if (actions.length <= index) {
        next(true);
        return;
    }

    // Get current action
    var action = actions[index];

    // If all ok start next recursion call
    var nextAction = (isSuccess) => {
        if (!isSuccess) {
            next(false);
            return;
        }

        RunActionsRecursion(actions, index + 1, next);
    }

    // First set the wanted state
    switchers.SetState(action.mac, action.state == 'on' ? true : false, (isSuccess) => {
        if (!isSuccess) {
            next(false);
            return;
        }

        // Then if it need addtional value set do it 
        switch (action.type) {
            case 'light':
                lights.SetValue(action.mac, action.set, nextAction);
                break;
            default:
                nextAction(isSuccess);
                break;
        }
    });
}

// Start invoke event by its id
var InvokeEvent = (id, next) => {
    if(!(id in events)){
        next(false);
        return;
    }
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