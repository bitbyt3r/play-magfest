<template>
	<div id="main-container" class="container">
		<div id="join" v-if="!session">
			<div id="join-dialog" class="jumbotron vertical-center">
				<h1>Host a game stream</h1>
				<form class="form-group" @submit="joinSession">
					<p>
						<label>Title</label>
						<input v-model="title" class="form-control" type="text" required>
					</p>
					<p>
						<label>Password</label>
						<input v-model="password" class="form-control" type="password">
					</p>
					<p>
						<label>Audio Capture Device</label>
						<select name="audiodevice" v-model="audiodevice">
							<option v-for="device in audiodevices" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
						</select>
					</p>
					<p>
						<label>Video Capture Device</label>
						<select name="videodevice" v-model="videodevice">
							<option v-for="device in videodevices" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
						</select>
					</p>
					<p class="text-center">
						<input class="btn btn-lg btn-success" type="submit" name="commit" value="Connect">
					</p>
				</form>
			</div>
		</div>

		<div id="session" v-if="session">
			<div id="session-header">
				<h1 id="session-title">{{ title }}</h1>
				<input class="btn btn-large btn-danger" type="button" id="buttonLeaveSession" @click="leaveSession" value="Disconnect">
			</div>
			<div id="video-container" class="col-md-6">
				<user-video :stream-manager="publisher"/>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import UserVideo from './components/UserVideo';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const OPENVIDU_SERVER_URL = "//" + location.hostname + ":" + location.port;

export default {
	name: 'Stream',

	components: {
		UserVideo,
	},

	data () {
		return {
			OV: undefined,
			audiodevice: "default",
			audiodevices: [],
			videodevice: "screen",
			videodevices: [{deviceId: "screen", label: "Screen Capture"}],
			session: undefined,
			publisher: undefined,
			title: 'SessionA',
			password: "",
			myUserName: 'Participant' + Math.floor(Math.random() * 100),
		}
	},

	mounted() {
		this.OV = new OpenVidu();
		this.OV.getDevices().then(devices => {
			this.audiodevices =  [];
			this.videodevices =  [{deviceId: "screen", label: "Screen Capture"}];
			devices.forEach(device => {
				if (device.kind === "audioinput") {
					this.audiodevices.push(device);
				}
				if (device.kind === "videoinput") {
					this.videodevices.push(device);
				}
			})
		});
	},

	methods: {
		joinSession () {
			this.session = this.OV.initSession();

			this.getToken(this.title, this.password).then(token => {
				this.session.connect(token, { clientData: this.myUserName })
					.then(() => {
						this.publisher = this.OV.initPublisher(undefined, {
							audioSource: this.audiodevice, // The source of audio. If undefined default microphone
							videoSource: this.videodevice, // The source of video. If undefined default webcam
							publishAudio: true,  	// Whether you want to start publishing with your audio unmuted or not
							publishVideo: true,  	// Whether you want to start publishing with your video enabled or not
							resolution: '640x480',  // The resolution of your video
							frameRate: 30,			// The frame rate of your video
							insertMode: 'APPEND',	// How the video is inserted in the target element 'video-container'
							mirror: false       	// Whether to mirror your local video or not
						});
						this.session.publish(this.publisher);
					})
					.catch(error => {
						console.log('There was an error connecting to the session:', error.code, error.message);
					});
			});

			window.addEventListener('beforeunload', this.leaveSession)
		},

		leaveSession () {
			if (this.session) this.session.disconnect();

			this.session = undefined;
			this.subscribers = [];
			this.OV = undefined;

			window.removeEventListener('beforeunload', this.leaveSession);
		},

		getToken (sessionId, password) {
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
	}
}
</script>
