<template>
	<video class="videoplayer" autoplay/>
</template>

<style>
.videoplayer {
	max-width:  1000px;
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
	},
};
</script>
