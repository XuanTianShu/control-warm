<template>
	<view class="container">
		<topbar :lefticon='true' leftText="HiWarm"></topbar>

		<view class="find">
			<image class="blue" src="../../static/image/blue.png" mode="widthFix"></image>
			<view class="radar" :class="!statu?'radarstop':''"></view>
		</view>

		<view class="loadingtitle">
			{{title}}
			<p>{{info}}</p>
		</view>

		<!-- 	<view v-if="old.length>0">
			<p class="font old">{{$t('index.historic-device')}}</p>
			<view @click="connect(item.deviceId)" class="device" v-for="(item,index) in old" :key="index">
				<image src="../../static/icon/blue.png" mode="widthFix"></image>
				{{item.name}}
			</view>
		</view> -->
		<view>
			<p class="font old">{{$t('index.new-device')}}</p>
			<view @click="choose(item)" class="device" v-for="(item,index) in list" :key="index">
				<image src="../../static/icon/blue.png" mode="widthFix"></image>
				{{item.name}}
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '',
				info: '',
				statu: false,
				list: []
			}
		},

		onLoad() {
			this.handlerBlue()
		},
		onShow() {
			this.init()
		},
		onUnload() {
			this.stopFind()
		},
		methods: {
			choose(val) {
				this.$store.state.device = val
				let devices = uni.getStorageSync('devices') || []
				let b = devices.every((value, index, array) => {
					if (value.deviceId == val.deviceId) {
						return false;
					}
					return true;
				});
				if (b) {
					devices.unshift(val)
					uni.setStorageSync('devices', devices)
				}
				this.stopFind()
				uni.navigateBack()
			},
			//监听蓝牙状态
			handlerBlue() {
				let that = this
				uni.onBluetoothAdapterStateChange(function(res) {
					console.log('changed', res.available)
					if (res.available) {
						// 如果未初始化
						if (!that.statu) {
							that.init()
						}
					} else {
						that.statu = false
						that.title = that.$t('index.connected')
						that.info = that.$t('index.error')
					}
				})
			},
			//初始化蓝牙
			init() {
				let that = this
				that.list = []
				let systemInfo = uni.getSystemInfoSync();
				let isandroid = systemInfo.platform.toLowerCase() === 'android';
				that.title = that.$t('index.findBlue')
				that.info = that.$t('index.wait')

				if (isandroid) {
					uni.getLocation({
						fail(res) {
							that.title = that.$t('index.findError')
							that.info = that.$t('index.error')
						}
					})
					that.start()
				} else {
					that.start()
				}
			},
			start() {
				let that = this
				uni.openBluetoothAdapter({
					success(res) {
						that.statu = true
						that.find()
					},
					fail(res) {
						that.statu = false
						console.log(res, 'res');
						if (res.code == 10001) {
							that.title = that.$t('index.findError')
							that.info = that.$t('index.error')
						}
					}
				})

			},
			// 搜寻附近蓝牙
			find() {
				let that = this
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: false,
					services: ['FEE7'],
					success(res) {
						setTimeout(() => {
							that.getDervices()
						}, 200)
					},
					fail(e) {
						console.log('搜寻失败', e);
					}
				})
			},
			// 获得设备列表
			getDervices() {
				let that = this
				uni.onBluetoothDeviceFound(function(res) {
					that.list.push(res.devices[0])
				})
			},
			// 停止匹配
			stopFind() {
				uni.stopBluetoothDevicesDiscovery({
					success(res) {
						console.log('停止搜寻', res)
					}
				})
			}


		}
	}
</script>

<style lang="less" scoped>
	.loadingtitle {
		width: 100%;
		margin-bottom: 30px;
		text-align: center;
		font-family: PingFang SC;
		font-size: 20px;
		font-weight: normal;
		line-height: 22px;
		letter-spacing: -0.41px;
		color: #B0B0B0;

		p {
			margin-top: 20px;
			font-family: PingFang SC;
			font-size: 14px;
			font-weight: normal;
			line-height: 22px;
			letter-spacing: -0.41px;
			color: #6A6A6A;
		}
	}

	.old {
		padding-left: 30rpx;
		margin-bottom: 20rpx;
	}

	.device {
		width: 90%;
		margin: 0 auto;
		margin-top: 20rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;

		image {
			width: 14px;
			margin-right: 16rpx;
		}
	}


	.find {
		width: calc(100vw - 40px);
		height: calc(100vw - 40px);
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;

		.blue {
			position: absolute;
			width: 118px;
			left: calc(50% - 59px);
			z-index: 999;
		}

		.radarstop {
			animation: unset !important;
			background: unset !important;
		}

		.radarstop::after,
		.radarstop::before {
			display: none !important;
			background: unset !important;
		}


		.radar {
			width: 200px;
			height: 200px;
			border-radius: 100%;
			background: conic-gradient(from 180deg at 50% 50%, #FD7311 0deg, rgba(253, 115, 17, 0.2) 190deg, rgba(253, 115, 17, 0) 360deg);
			animation: rotate 2s linear infinite;
			position: relative;
			z-index: 99;
		}

		.radar::before,
		.radar::after {
			content: "";
			display: block;
			position: absolute;
			z-index: 90;
			width: 100%;
			height: 100%;
			background: rgba(253, 115, 17, 0.2);
			border-radius: 50%;
			animation: ripple1 2s infinite;
		}

		.radar::after {
			animation: ripple2 2s infinite;
			z-index: 1;
		}

	}

	@keyframes rotate {
		0% {
			transform: rotate(360deg);
		}

		100% {
			transform: rotate(0deg);
		}
	}

	@keyframes ripple1 {
		0% {
			transform: scale(1);
		}

		100% {
			transform: scale(1.4);
			opacity: 0.0;
		}
	}

	@keyframes ripple2 {
		0% {
			transform: scale(1);
		}

		100% {
			transform: scale(1.8);
			opacity: 0.0;
		}
	}
</style>