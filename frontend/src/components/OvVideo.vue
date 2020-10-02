<template>
	<video class="videoplayer" autoplay/>
</template>

<style>
.videoplayer {
	width:  640px;
	height: 480px;
	z-index: -1;
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
		this.$el.controls = true;
	},
};
</script>
