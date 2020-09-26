const ipcRenderer = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;

var openvidu = new OpenVidu();
var session;
var publisher;
var mySessionId;

ipcRenderer.on('screen-share-ready', (event, message) => {
    showSession();
    publisher = openvidu.initPublisher("publisher", {
        videoSource: "screen:" + message
    });
    window.publisher = publisher;
    joinSession();
});

function initPublisher() {
    const useCamera = document.getElementById("use-camera").checked;
    if (!useCamera) {
        openScreenShareModal();
    } else {
        showSession();
        var videoselect = document.getElementById("videoinput");
        var audioselect = document.getElementById("audioinput");
        var audioinput = videoselect.value;
        var videoinput = videoselect.value;
        if (audioselect.value === "false") {
            audioinput = false;
        }
        if (videoselect.value === "false") {
            videoinput = false;
        }
        publisher = openvidu.initPublisher("publisher", {
            videoSource: videoinput,
            audioSource: audioinput
        });
        joinSession();
    }
}

function joinSession() {

    session = openvidu.initSession();

    mySessionId = document.getElementById("sessionId").value;
    password = document.getElementById("password").value;

    getToken(mySessionId, password).then(token => {
        session.connect(token, {clientData: 'Game Capture'})
            .then(() => {
                showSession();
                session.publish(publisher);
            })
            .catch(error => {
                console.log("There was an error connecting to the session:", error.code, error.message);
            });
    });
}

function leaveSession() {
    session.disconnect();
    hideSession();
}

function showSession() {
    document.getElementById("session-header").innerText = mySessionId;
    document.getElementById("join").style.display = "none";
    document.getElementById("session").style.display = "block";
}

function hideSession() {
    document.getElementById("join").style.display = "block";
    document.getElementById("session").style.display = "none";
}

function openScreenShareModal() {
    let win = new BrowserWindow({
        parent: require('electron').remote.getCurrentWindow(),
        modal: true,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    })
    win.setMenu(null);
    // win.webContents.openDevTools();

    var theUrl = 'file://' + __dirname + '/modal.html'
    win.loadURL(theUrl);
}

var OPENVIDU_SERVER_URL = "https://play.magfest.org";

function getToken (sessionId, password) {
    return new Promise((resolve, reject) => {
        axios
            .post(`${OPENVIDU_SERVER_URL}/authenticate/gettoken`, {session: sessionId, password: password})
            .then(response => response.data)
            .then(data => resolve(data.token))
            .catch(error => {
                console.log("Failed to get token.");
                reject(error.response);
            });
    });
}

window.onload = function loaded() {
    openvidu.getDevices().then(devices => {
        var videoselect = document.getElementById("videoinput");
        var audioselect = document.getElementById("audioinput");
        videohtml = '<option value="false">None</option>';
        audiohtml = '<option value="false">None</option>';
        devices.forEach(device => {
            if (device.kind === "audioinput") {
                audiohtml += '<option value="' + device.deviceId + '">' + device.label + '</option>';
            }
            if (device.kind === "videoinput") {
                videohtml += '<option value"' + device.deviceId + '">' + device.label + '</option>';
            }
        });
        audioselect.innerHTML = audiohtml;
        videoselect.innerHTML = videohtml
    });
}
