<template>
	<view class="container">
		<topbar :title="this.$t('device.Introduction')" :righticon='false'></topbar>
		<image style="width: 100vw;" :src="src" mode="widthFix"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				src: '../../static/image/bgImage.png'
			}
		}
	}
</script>

<style lang="scss" scoped>
	image {
		position: absolute;
		top: 44px;
		left: 0;
	}
</style>