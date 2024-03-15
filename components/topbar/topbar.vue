<template>
	<view class="topbar">
		<span v-if="leftText">HiWarm</span>
		<image v-else @click="goBack" class="back" src="@/static/icon/back.png" mode=""></image>
		<span class="s">{{title}}</span>
		<image @click="goTo" v-if="righticon" class="icon" src="@/static/icon/hanbb.png" mode=""></image>
		<view v-else></view>
	</view>
</template>

<script>
	export default {

		props: {
			title: {
				type: String,
				default: ''
			},
			leftText: {
				type: String,
				default: ''
			},
			righticon: {
				type: Boolean,
				default: true
			},
		},

		methods: {
			goBack() {
				uni.navigateBack()
			},
			goTo() {
				uni.navigateTo({
					url: '/pages/explain/explain'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.topbar {
		position: relative;
		height: 70px;
		width: 100%;
		z-index: 999;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		font-family: PingFangSCBold-Bold;
		font-size: 20px;
		font-weight: normal;
		padding: 0 10rpx;
		line-height: 25px;
		letter-spacing: 0px;

		.icon {
			height: 14px;
			width: 16px;
		}

		.back {
			height: 15px;
			width: 18px;
		}

		.s {
			font-size: 17px;
			line-height: 25px;
		}
	}
</style>