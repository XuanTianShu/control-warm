<template>
	<view class="container">
		<topbar :title="this.$t('device.Introduction')" :righticon='false' ></topbar>
		<image v-if="$store.state.bgimg" style="width: 100vw;"  :src="$store.state.bgimg" mode="widthFix"></image>
		<image v-else style="width: 100vw;" src="@/static/image/bgImage.png" mode="widthFix"></image>
	</view>
</template>

<script>
	export default {
		
	}
</script>

<style lang="scss" scoped>
image{
	position: absolute;
	top: 44px;
	left: 0;
}
</style>
