// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var autobahn = require('autobahn');

var connection = new autobahn.Connection({
    url: "wss://crossbar.hackafe.net:7778/ws",
    realm: "realm1",
    use_es6_promises: true
});

var subscription = null;
var interval = null;
var wamp = null;
var clients = {};
var previous_frame = {};
var previous_axes = {};

function clientUpdate(args, kwargs, details) {
    const sessionID = details.topic.split(".")[0];
    if (!Object.prototype.hasOwnProperty.call(clients, sessionID)) {
        clients[sessionID] = {};
    }
    clients[sessionID][details.publisher] = {
        timestamp: Date.now(),
        state: args[0]
    }
}

function broadcastUpdates() {
    const now = Date.now();
    var current_frame = {};
    for (const [sessionID, sessionClients] of Object.entries(clients)) {
        current_frame = {buttons: {}, axes: {}};
        for (const [clientID, client] of Object.entries(sessionClients)) {
            if (now - client.timestamp > 10000) {
                delete sessionClients[clientID];
                continue;
            }

            for (const [button, state] of Object.entries(client.state)) {
                if (Array.isArray(state)) {
                    if (Math.abs(state[0])+Math.abs(state[1]) < 0.1) {
                        continue;
                    }
                    if (!Object.prototype.hasOwnProperty.call(current_frame.axes, button)) {
                        current_frame.axes[button] = [];
                    }
                    current_frame.axes[button].push(state)
                } else {
                    // Handle buttons
                    if (!Object.prototype.hasOwnProperty.call(current_frame.buttons, button)) {
                        current_frame.buttons[button] = {
                            up: 0,
                            down: 0,
                        };
                    }
                    if (Object.prototype.hasOwnProperty.call(previous_frame, clientID+'.'+button)) {
                        const previous_state = previous_frame[clientID+'.'+button];
                        const current_state = state > 0.9;
                        if (current_state && !previous_state) {
                            current_frame.buttons[button].up += 1;
                        }
                        if (!previous_state && !current_state) {
                            current_frame.buttons[button].down += 1;
                        }
                    }
                    previous_frame[clientID+'.'+button] = state;
                }
            }
        }

        var state = {buttons: {}, axes: {analog0: [0,0], analog1: [0,0]}};
        for (const [button, changes] of Object.entries(current_frame.buttons)) {
            state.buttons[button] = (changes.down > changes.up) ? false : true;
        }
        for (const [axis, states] of Object.entries(current_frame.axes)) {
            var x = 0;
            var y = 0;
            if (states.length > 0) {
                states.forEach(n => {
                    x += n[0];
                    y += n[1];
                });
                x = x / states.length;
                y = y / states.length;
            }
            state.axes[axis] = [x, y];
        }
        wamp.publish(sessionID+'.controller', [state]);
        wamp.publish(sessionID+'.feedback', [{...state.buttons, ...state.axes}]);

        if (Object.keys(sessionClients).length === 0) {
            delete clients[sessionID];
        }
    }
}

connection.onopen = function(session) {
    wamp = session;
    session.subscribe('.inputs', clientUpdate, { match: "wildcard" }).then(sub => {
        subscription = sub;
    });
    interval = setInterval(broadcastUpdates, 30);
}

connection.onclose = function(session) {
    clearInterval(interval);
    session.unsubscribe(subscription);
}

connection.open();
