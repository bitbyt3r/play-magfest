<template>
	<div id="main-container" class="container">
        <img src="/background.jpg" ref="background" class="background">
        <div ref="content" id="join-dialog" class="jumbotron vertical-center">
            <h1>MAGFest Plays</h1>
            <p>Now every game is multiplayer! Everyone watching the below game streams has partial control of the console. Use keyboard or gamepad controls to play. The inputs are averaged across everyone playing, so every button press is a vote in realtime.</p>
            <b-card-group columns>
                <b-card v-for="info in sessions" :key="info.sessionId" :title="info.title" :img-src="'/'+info.thumbnail" img-top>
                    <b-card-text>
                        <p><b>Console:</b> {{ info.console }}</p>
                        <p><b>Description:</b> {{ info.description }}</p>
                        <b-button @click="$router.push('/play/'+info.sessionID)">Launch</b-button>
                    </b-card-text>
                </b-card>
            </b-card-group>
        </div>x
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

axios.defaults.headers.post['Content-Type'] = 'application/json';

const OPENVIDU_SERVER_URL = "//" + location.hostname + ":" + location.port;

export default {
	name: 'Menu',

	data () {
		return {
			sessions: [],
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
			this.$refs.background.style.top = -1 * scrollpercent * (backgroundHeight - innerHeight) + "px";
		},
	}
}
</script>
