// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { vJoy, vJoyDevice } = require('vjoy');
var autobahn = require('autobahn');

if (!vJoy.isEnabled()) {
	console.log("vJoy is not enabled.");
	process.exit();
}

console.log("Running vjoy");
let device = vJoyDevice.create(1);

var connection = new autobahn.Connection({
    url: "wss://crossbar.hackafe.net:7778/ws",
    realm: "realm1",
    use_es6_promises: true
});

var subscription = null;
var sessionID = "katamari";

button_names = {
    a:         0, 
    b:         1, 
    x:         2, 
    y:         3, 
    lshoulder: 4, 
    rshoulder: 5, 
    ltrigger:  6,
    rtrigger:  7,
    select:    8, 
    start:     9, 
    lstick:    10,
    rstick:    11,
    up:        12,
    down:      13,
    left:      14,
    right:     15,
};

axis_names = {
    analog0: ['X', 'Y'],
    analog1: ['RX', 'RY'],
}

connection.onopen = function(session, details) {
    function updateJoystick(args) {
        console.log("Got joystick event", args);
        inputs = args[0];
        for (const [name, value] of Object.entries(inputs.buttons)) {
            device.buttons[button_names[name]].set(value);
        }
        for (const [name, value] of Object.entries(inputs.axes)) {
            names = axis_names[name];
            device.axes[names[0]].set(value[0]);
            device.axes[names[1]].set(value[1]);
        }
    }

    session.subscribe(sessionID+'.controller', updateJoystick).then(
        function (sub) {
            subscription = sub;
        },
        function (error) {
            console.log(error);
        }
    );

    var el = document.getElementById('sessionID');

    function updateSession() {
        sessionID = el.value;
        session.unsubscribe(subscription);
        session.subscribe(sessionID+'.controller', updateJoystick).then((sub) => {
            subscription = sub;
        });
    }

    el.addEventListener('input', updateSession);
}

connection.open();
