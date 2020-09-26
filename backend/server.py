from flask import Flask, request, jsonify
app = Flask(__name__)
import requests
from requests.auth import HTTPBasicAuth
import sys
import os

if not 'OPENVIDU_URL' in os.environ:
    sys.exit("OPENVIDU_URL is undefined! This should point to the openvidu backend server. Probably port 5443?")
OPENVIDU_URL = os.environ['OPENVIDU_URL']
if not 'OPENVIDU_SECRET' in os.environ:
    sys.exit("OPENVIDU_SECRET is undefined! This should be the server secret for openvidu.")
OPENVIDU_SECRET = os.environ['OPENVIDU_SECRET']

@app.route("/")
def home():
    return "Hello world!"

@app.route("/authenticate/gettoken", methods=["POST"])
def gettoken():
    if not 'session' in request.json:
        return "You must pass a session.", 403
    req = requests.post(OPENVIDU_URL+"/api/sessions", json={"customSessionId": request.json['session']}, auth=HTTPBasicAuth('OPENVIDUAPP', OPENVIDU_SECRET))
    if req.status_code == 409:
        print("Session {} already exists, reusing.".format(request.json['session']))
        sessionId = request.json['session']
    else:
        sessionId = req.json()['id']
    req = requests.post(OPENVIDU_URL+"/api/tokens", json={"session": sessionId}, auth=HTTPBasicAuth('OPENVIDUAPP', OPENVIDU_SECRET))
    token = req.json()['token']
    return jsonify(token=token)

if __name__ == "__main__":
    app.run("0.0.0.0", 8081)