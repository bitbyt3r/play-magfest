<template>
	<video class="videoplayer" autoplay controls="true"/>
</template>

<style>
.videoplayer {
	width:  640px;
	height: 480px;
}
</style>

<script>
export default {
	name: 'OvVideo',

	props: {
		streamManager: Object,
	},

	mounted () {
		this.streamManager.addVideoElement(this.$el);
		this.$el.volume = 0.5;
	},
};
</script>
