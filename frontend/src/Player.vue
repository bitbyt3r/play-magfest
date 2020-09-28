<template>
	<div id="main-container" class="container">
		<div id="join" v-if="!session">
			<img src="background.png" ref="background" class="background">
			<div ref="content" id="join-dialog" class="jumbotron vertical-center">
				<h1>MAGFest Plays</h1>
				<p>Now every game is multiplayer! Everyone watching the below game streams has partial control of the console. Use keyboard or gamepad controls to play. The inputs are averaged across everyone playing, so every button press is a vote in realtime.</p>
				<b-card-group columns>
					<b-card v-for="info in sessions" :key="info.sessionId" :title="info.title" :img-src="info.thumbnail" img-top>
						<b-card-text>
							<p><b>Console:</b> {{ info.console }}</p>
							<p><b>Description:</b> {{ info.description }}</p>
							<b-button @click="joinSession(info)">Launch</b-button>
						</b-card-text>
					</b-card>
				</b-card-group>
			</div>x
		</div>

		<div id="session" v-if="session">
			<b-card-group deck>
				<b-card :title="activeSession.title">
					<b-card-text>
						<user-video v-for="(sub, index) in subscribers" :key="index" :stream-manager="sub"/>
					</b-card-text>
				</b-card>
				<b-card class="controls" title="Controls">
					<b-card-text>
						<game-pad :controller="activeSession.controller" :sessionID="activeSession.sessionID" :key="activeSession.controller"></game-pad>
						<input class="btn btn-large btn-danger" type="button" id="buttonLeaveSession" @click="leaveSession" value="Back To Menu">
					</b-card-text>
				</b-card>
			</b-card-group>
		</div>
	</div>
</template>

<style scoped>
.controls {
	max-width: 350px;
}
.background {
	width: 100vw;
	height: 1600px;
	position: fixed;
	left: 0;
	top: 0;
	bottom: 0;
	right: 0;
	z-index: -1;
	overflow: hidden;
}
</style>

<script>
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import UserVideo from './components/UserVideo';
import GamePad from './components/Gamepad';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const OPENVIDU_SERVER_URL = "//" + location.hostname + ":" + location.port;

export default {
	name: 'Player',

	components: {
		UserVideo,
		GamePad,
	},

	data () {
		return {
			OV: undefined,
			subscribers: [],
			sessions: [],
			activeSession: {},
			session: undefined,
			username: 'Participant' + Math.floor(Math.random() * 10000),
		}
	},
	mounted() {
		axios.get(`${OPENVIDU_SERVER_URL}/authenticate/sessions`)
		.then(response => response.data)
		.then(sessions => {
			this.sessions = sessions;
		});
		window.addEventListener('scroll', this.updateScroll);
	},
	beforeDestroy() {
		window.removeEventListener('scroll', this.updateScroll);
	},
	methods: {
		updateScroll () {
			const innerHeight = this.$refs.content.offsetHeight;
			const backgroundHeight = this.$refs.background.offsetHeight;
			const windowHeight = window.innerHeight;
			const scrollpercent = window.scrollY / (innerHeight - windowHeight);
			console.log(innerHeight, backgroundHeight, windowHeight, scrollpercent);
			this.$refs.background.style.top = -1 * scrollpercent * (backgroundHeight - innerHeight) + "px";
		},
		joinSession (sessionInfo) {
			this.OV = new OpenVidu();
			this.session = this.OV.initSession();
			this.activeSession = sessionInfo;

			this.session.on('streamCreated', ({ stream }) => {
				const subscriber = this.session.subscribe(stream);
				console.log(subscriber, stream);
				this.subscribers.push(subscriber);
			});

			this.session.on('streamDestroyed', ({ stream }) => {
				const index = this.subscribers.indexOf(stream.streamManager, 0);
				if (index >= 0) {
					this.subscribers.splice(index, 1);
				}
			});

			this.getToken(sessionInfo.sessionID).then(token => {
				this.session.connect(token, { clientData: this.username })
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

		getToken (sessionId) {
			return new Promise((resolve, reject) => {
				axios
					.post(`${OPENVIDU_SERVER_URL}/authenticate/gettoken`, {session: sessionId, password: ""})
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
