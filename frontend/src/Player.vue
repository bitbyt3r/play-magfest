<template>
	<div id="main-container" class="container">
		<b-card-group deck>
			<b-card :title="activeSession.title">
				<b-card-text>
					<user-video v-for="(sub, index) in subscribers" :key="index" :stream-manager="sub"/>
					<a href="https://discord.gg/magfest">Chat with the other players on MAGFest's Discord Server</a><br>
					(Use the MAGWest 2020 > MAGPlays audio chat!)
				</b-card-text>
			</b-card>
			<b-card class="controls" title="Controls">
				<b-card-text>
					<game-pad v-if="activeSession.sessionID" :controller="activeSession.controller" :sessionID="activeSession.sessionID" :key="activeSession.controller" ref="controller"></game-pad>
					<input class="btn btn-large btn-danger" type="button" id="buttonLeaveSession" @click="$router.push('/')" value="Back To Menu">
				</b-card-text>
			</b-card>
		</b-card-group>
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

	props: {
		sessionID: {
			type: String,
			default: "",
		}
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
			this.sessions.forEach(sess => {
				if (sess.sessionID === this.sessionID) {
					this.joinSession(sess);
				}
			});
		});
	},
	methods: {
		joinSession (sessionInfo) {
			this.OV = new OpenVidu();
			this.session = this.OV.initSession();
			this.activeSession = sessionInfo;

			this.session.on('streamCreated', ({ stream }) => {
				const subscriber = this.session.subscribe(stream);
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

			window.addEventListener('beforeunload', this.leaveSession);
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
