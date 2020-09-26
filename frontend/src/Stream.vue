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
                                <input type="number" v-model="crop.top">
                                <input type="number" v-model="crop.bottom">
                                <input type="number" v-model="crop.left">
                                <input type="number" v-model="crop.right">
				<input class="btn btn-large btn-danger" type="button" id="buttonCrop" @click="updateCrop" value="Update Crop">
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
                        crop: {top: 0, bottom: 0, left: 0, right: 0},
                        filter: false,
		}
	},

	mounted() {
		this.OV = new OpenVidu();
		navigator.mediaDevices.getUserMedia({audio:true, video:true}).then(stream => {
			var tracks = stream.getTracks();
			tracks.forEach(track => {
				track.stop();
			});
			navigator.mediaDevices.enumerateDevices().then(devices => {
				this.audiodevices =  [];
				this.videodevices =  [{deviceId: "screen", label: "Screen Capture"}];
				console.log(devices);
				devices.forEach(device => {
					if (device.kind === "audioinput") {
						this.audiodevices.push(device);
					}
					if (device.kind === "videoinput") {
						this.videodevices.push(device);
					}
				})
			});
		});
	},

	methods: {
		updateCrop() {
			if (this.filter) {
				this.publisher.stream.removeFilter().then(() => {
					this.publisher.stream.applyFilter("GStreamerFilter", { command: "videocrop top="+this.crop.top+" bottom="+this.crop.bottom+" left="+this.crop.left+" right="+this.crop.right });
				});
			} else {
				this.filter = true;
				this.publisher.stream.applyFilter("GStreamerFilter", { command: "videocrop top="+this.crop.top+" bottom="+this.crop.bottom+" left="+this.crop.left+" right="+this.crop.right });
			}
		},
		joinSession () {
			this.session = this.OV.initSession();

			this.getToken(this.title, this.password).then(resp => {
				if (resp.role === "PUBLISHER" || resp.role === "MODERATOR") {
					this.session.connect(resp.token, { clientData: this.myUserName })
					.then(() => {
						navigator.mediaDevices.getUserMedia({
							audio: {
								deviceId: this.audiodevice.deviceId,
								autoGainControl: false,
								echoCancellation: false,
								noiseSuppression: false,
							},
							video: {
								deviceId: this.videodevice.deviceId,
							}
						}).then(stream => {
							var audioTracks = stream.getAudioTracks();
							var videoTracks = stream.getVideoTracks();
							var audio = audio;
							var video = video;
							if (audioTracks.length > 0) {
								console.log("Attempting to open audio track", audioTracks[0]);
								audio = audioTracks[0];
							}
							if (videoTracks.length > 0) {
								console.log("Attempting to open video track", videoTracks[0]);
								video = videoTracks[0];
							}
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
						});
					})
					.catch(error => {
						console.log('There was an error connecting to the session:', error.code, error.message);
					});
				} else {
					this.session = null;
					console.log("Could not get a publisher or moderator role. Probably incorrect password?");
				}
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
					.then(data => resolve(data))
					.catch(error => {
						console.log("Failed to get token.");
						reject(error.response);
					});
			});
		}
	}
}
</script>
