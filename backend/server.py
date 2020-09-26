from flask import Flask, request, jsonify
app = Flask(__name__)
import requests
from requests.auth import HTTPBasicAuth
import redis
import sys
import os

if not 'OPENVIDU_URL' in os.environ:
    sys.exit("OPENVIDU_URL is undefined! This should point to the openvidu backend server. Probably port 5443?")
OPENVIDU_URL = os.environ['OPENVIDU_URL']
if not 'OPENVIDU_SECRET' in os.environ:
    sys.exit("OPENVIDU_SECRET is undefined! This should be the server secret for openvidu.")
OPENVIDU_SECRET = os.environ['OPENVIDU_SECRET']

auth = HTTPBasicAuth('OPENVIDUAPP', OPENVIDU_SECRET)
r = redis.Redis(host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASSWORD'])

@app.route("/")
def home():
    return "Hello world!"

@app.route("/authenticate/gettoken", methods=["POST"])
def gettoken():
    if not 'session' in request.json:
        return "You must pass a session.", 403
    role = "SUBSCRIBER"
    if 'password' in request.json:
        if request.json['password'] == OPENVIDU_SECRET:
            role = "MODERATOR"
    req = requests.post(OPENVIDU_URL+"/api/sessions", json={"customSessionId": request.json['session']}, auth=auth)
    if req.status_code == 409:
        print("Session {} already exists, reusing.".format(request.json['session']))
        sessionId = request.json['session']
    else:
        sessionId = req.json()['id']
    req = requests.post(OPENVIDU_URL+"/api/tokens", json={"session": sessionId, "role": role}, auth=auth)
    token = req.json()['token']
    return jsonify(token=token, role=role)

@app.route("/authenticate/sessions", methods=["GET"])
def getsessions():
    req = requests.get(OPENVIDU_URL+"/api/sessions", auth)
    sessionIDs = [x['sessionId'] for x in req.json()['content']]
    sessions = []
    for ID in sessionIDs:
        session = r.get(ID)
        if session:
            sessions.append(session)
    return jsonify(sessions)

@app.route("/authenticate/session/<string:session>", methods=["POST"])
def postsession(session):
    if not 'token' in request.json:
        return "You must post the token of the session to edit the info.", 403
    req = requests.get(OPENVIDU_URL+"/api/sessions/"+session, auth=auth)
    token = req.json()['token']
    if token != request.json['token']:
        return "You passed the wrong token for this session.", 403
    if not 'session' in request.json:
        return "You must pass a session object.", 405
    r.set(session, request.json['session'])
    return jsonify(request.json['session'])

if __name__ == "__main__":
    app.run("0.0.0.0", 8081)
