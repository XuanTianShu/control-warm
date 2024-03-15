<template>
	<view class="container">

		<topbar leftText="HiWarm"></topbar>

		<view class="_img" v-show="banner.length">
			<swiper change="swp" :autoplay="true" :interval="3000">
				<swiper-item v-for="i in banner">
					<image :src="i.src" mode="widthFix"></image>
				</swiper-item>
			</swiper>
		</view>

		<scroll-view class="scrollbox" v-if="deviceList.length" scroll-y="true">
			<view class="u-flex deviceList" v-for="(item,index) in deviceList" :key="index">
				<view class="device bgc" @touchstart="todStart(index)" @touchmove="todmove" @touchend="todend">
					<!-- 点击连接蓝牙 -->
					<view class="icon" @click="connect(item.deviceId)">
						<view class="leiting" :class="0?'lighting':''"></view>
						<lj-chart :rotate="0" :diameter="30"></lj-chart>
						<view class="dianliang" :class="0?'battery':''"></view>
					</view>
					<view class="deviceInfo">
						<!-- 点击连接蓝牙 -->
						<view class="info" @click="connect(item.deviceId)">
							<p style="font-size: 36px;">60.2℃</p>
							<span>{{item.name}}</span>
						</view>
						<view class="edit">
							<!-- 断开蓝牙 -->
							<view class="t" @click="close(item.deviceId)">
								<image class="wz"
									:src="item.switchOpen?'../../static/icon/b.png':'../../static/icon/c.png'"
									mode="widthFix"></image>
								<image class="close"
									:src="item.deviceId==deviceId && $store.state.isConnect?'../../static/icon/e.png':'../../static/icon/a.png'"
									mode="widthFix"></image>
							</view>
							<!-- 加热开关 -->
							<view class="b">
								{{item.switchOpen?'on':'off'}}
								<u-switch :disabled='deviceId!=item.deviceId' v-model="item.switchOpen" @change='heat'
									active-color="#FD7311" :size='20' inactive-color="#282B2E"></u-switch>
							</view>
						</view>
					</view>
				</view>
				<view v-if="idx==index && edit" class="u-flex u-m-l-20 btn-box">
					<view class="u-flex button-del" @click="removeDevice(item.deviceId)">删除</view>
					<!-- <view class="u-flex button-edit">编辑</view> -->
				</view>
			</view>
		</scroll-view>
		<view v-else class="nodevice font">
			<image src="@/static/image/not.png" mode="widthFix"></image>
			{{$t('index.no-device')}}
		</view>
		<view class="operate font">
			<navigator url="/pages/findBlue/findBlue" class="btn">
				<image src="@/static/image/find.png" mode="aspectFit">
				</image>
				<view class="find">{{$t('index.search')}}</view>
			</navigator>
			<view class="btn">
				<image src="@/static/image/control.png" mode="aspectFit">
				</image>
				<view @click="goTo">{{$t('index.control')}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		imgList,
		add,
		oldDevice
	} from '@/api/index.js';
	import {
		vShow
	} from "vue";
	export default {
		data() {
			return {
				banner: [{
					src: '../../static/image/demo1.png'
				}],

				deviceList: [],

				stu: false,
				deviceId: '',
				serviceId: '',
				uuid: '',
				// 滑动操作
				moveX: 0,
				idx: -1,
				edit: false
			}
		},
		onLoad() {
			this.$store.state.device = ''
			this.handlerConnect()
			this.init()
		},
		onShow() {
			this.deviceList = uni.getStorageSync('devices')
			if (this.deviceList.length)
				this.deviceList.forEach(item => {
					this.$set(item, 'switchOpen', false)
				})
			if (this.$store.state.device && !this.$store.state.isConnect) {
				this.connect(this.$store.state.device.deviceId)
			}
		},
		methods: {
			init() {
				let setting = uni.getStorageSync('settings')
				if (!setting.length) {
					// 默认设置
					setting = [{
							title: this.$t('setting.unit'),
							btn: [
								this.$t('setting.celsius'), this.$t('setting.fahrenheit')
							],
							idx: 0
						},
						{
							title: this.$t('setting.habit'),
							btn: [
								this.$t('setting.left'), this.$t('setting.right')
							],
							idx: 1
						},
						{
							title: this.$t('locale.language'),
							btn: [
								this.$t('locale.zh-hans'), this.$t('locale.en')
							],
							idx: 0
						},
						{
							title: this.$t('device.Introduction'),
							btn: [
								this.$t('device.view'),
							]
						},
					]
				} else {
					// 缓存设置
					let arr = [{
							title: this.$t('setting.unit'),
							btn: [
								this.$t('setting.celsius'), this.$t('setting.fahrenheit')
							],
							idx: setting[0].idx
						},
						{
							title: this.$t('setting.habit'),
							btn: [
								this.$t('setting.left'), this.$t('setting.right')
							],
							idx: setting[1].idx
						},
						{
							title: this.$t('locale.language'),
							btn: [
								this.$t('locale.zh-hans'), this.$t('locale.en')
							],
							idx: setting[2].idx
						},
						{
							title: this.$t('device.Introduction'),
							btn: [
								this.$t('device.view'),
							]
						},
					]
					setting = [...arr]
				}
				uni.setStorageSync('settings', setting)
				uni.setStorageSync('direction', setting[1].idx)
			},
			// 初始化图片
			async getImg() {
				// let res = await imgList()
				// this.banner = res.data || []
			},
			// 滑动操作
			todStart(index) {
				this.idx = index
				this.moveX = ''
				this.edit = false
			},
			todmove(e) {
				if (!this.moveX) {
					this.moveX = e.touches[0].pageX;
				}
			},
			todend(e) {
				const pageX = e.changedTouches[0].pageX;
				if ((pageX - this.moveX) > 20) {
					this.edit = false
				} else {
					this.edit = true
				}
			},
			// 删除设备
			removeDevice(deviceId) {
				this.deviceList = this.deviceList.filter(function(item) {
					return item.deviceId !== deviceId;
				});
				uni.setStorageSync('devices', this.deviceList)
				this.moveX = ''
				this.edit = false
			},
			// 初始化  连接蓝牙
			connect(deviceId) {
				let that = this
				that.deviceId = deviceId
				uni.openBluetoothAdapter({
					success(r) {
						uni.createBLEConnection({
							deviceId: deviceId,
							success(res) {
								console.log('连接成功', res)
								setTimeout(() => {
									that.getBlueService()
								}, 1000)
							},
							fail(res) {
								console.error('连接fail：', res);
								setTimeout(() => {
									that.getBlueService()
								}, 1000)
							}
						})
					},
					fail(res) {
						console.log(res, '初始化失败');
					}
				})
			},
			// 断开连接
			close(deviceId) {
				let that = this
				// 加热状态关
				that.switchOpen = false
				if (that.$store.state.isConnect) {
					// 发送关命令
					that.write('A500000100')
				}
				// 断开蓝牙
				uni.closeBLEConnection({
					deviceId,
					success(res) {
						console.log(res)
						that.stu = false
					}
				})
			},
			// 监听蓝牙连接
			handlerConnect() {
				let that = this
				uni.onBLEConnectionStateChange(function(res) {
					console.log(res);
					// 连接断开
					if (!res.connected) {
						that.$store.state.isConnect = res.connected
					}
				})
			},
			// 获取 serviceId
			getBlueService() {
				let that = this
				uni.getBLEDeviceServices({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.deviceId,
					success(res) {
						console.error('Services:', res)
						that.serviceId = res.services[0].uuid
						that.getBLEDeviceCharacteristics()
					},
					fail(res) {
						console.log('serviceId fail', res);
					}
				})
			},
			//   获取 uuid
			getBLEDeviceCharacteristics() {
				let that = this
				uni.getBLEDeviceCharacteristics({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.deviceId,
					// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					serviceId: that.serviceId,
					success(res) {
						console.log('Characteristics:', res.characteristics)
						that.$store.state.isConnect = true
						res.characteristics.forEach(item => {

							let obj = {
								deviceId: that.deviceId,
								serviceId: that.serviceId
							}

							if (item.properties.notify) {
								that.notify(item.uuid)
								obj.characteristicId = item.uuid
							}
							if (item.properties.write) {
								that.uuid = item.uuid
								obj.uuid = item.uuid
							}
							that.$store.state.device = obj
						})
					}
				})
			},
			notify(characteristicId) {
				let that = this
				uni.notifyBLECharacteristicValueChange({
					state: true, // 启用 notify 功能
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.deviceId,
					// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					serviceId: that.serviceId,
					// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
					characteristicId: characteristicId,
					success(res) {
						that.onBle()
						// 尝试发送指令
						console.log('开始发送命令');
						let str = 'A500000000'
						setTimeout(() => {
							that.write(str)
						}, 1000)
					}
				})

			},
			onBle() {
				let that = this
				that.stu = true
				uni.onBLECharacteristicValueChange(function(res) {
					console.log(`监听消息`, res)
					console.log('解析', that.ab2hex(res.value))
				})
			},
			// 加热
			heat(e) {
				if (this.$store.state.isConnect) {
					if (e) {
						// 加热开
						this.write('AA01010100')
					} else {
						// 加热关
						this.write('AA01010000')
					}
				}

			},
			// 发送指令
			write(str) {
				// A501000000
				// A601000000
				console.log('命令：', str);
				let that = this
				let data = new Uint8Array(str.match(/[\da-f]{2}/gi).map(function(h) {
					return parseInt(h, 16)
				}))


				uni.writeBLECharacteristicValue({
					deviceId: that.deviceId,
					serviceId: that.serviceId,
					characteristicId: that.uuid,
					value: data.buffer,
					success(res) {
						console.log('发送成功', res)
					},
					fail(e) {
						console.log('发送失败', e)
					}
				})
			},
			ab2hex(buffer) {
				const hexArr = Array.prototype.map.call(
					new Uint8Array(buffer),
					function(bit) {
						return ('00' + bit.toString(16)).slice(-2)
					}
				)
				return hexArr.join('')
			},
			goTo() {
				// if (this.$store.state.isConnect) {
				uni.navigateTo({
					url: '/pages/device/device'
				})
				// } else {
				// 	uni.showToast({
				// 		title: '请先连接蓝牙',
				// 		icon: 'error'
				// 	})
				// }

			},
		}
	}
</script>

<style lang="less" scoped>
	._img {
		border-radius: 20rpx;
		overflow: hidden;
		margin: 30rpx 0;

		.swp {
			height: 40vh;
		}

		image {
			width: 100%;
		}
	}


	.container {
		// padding: 30rpx 0;
	}

	.deviceList {
		margin-top: 20rpx;
		justify-content: flex-end;
		align-items: stretch;

	}

	.btn-box {
		height: inherit;
	}

	.button-del,
	.button-edit {
		width: 83px;
		height: 100%;
		justify-content: center;
	}

	.button-del {
		background-color: #EB3423;
	}

	.button-edit {
		background-color: #5E5E5E;
	}

	.scrollbox {
		min-height: 30vh;
		height: auto;
		max-height: 50vh;
		margin-top: 20rpx;
	}

	.device {
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		border-radius: 20rpx;
		min-width: 65%;
		width: 100%;

		.deviceInfo {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			border-left: 0.5px solid #58595B;
			padding-left: 20rpx;
			margin-left: 20rpx;
			font-family: PingFangSCMedium-Medium;
			font-size: 14px;
			font-weight: normal;
			line-height: 22px;
			letter-spacing: -0.41px;
			color: #797979;

			span {
				padding-left: 10rpx;
			}

			p {
				font-family: PingFang SC;
				font-size: 30px;
				letter-spacing: 0em;
				color: #D3D3D3;
				margin-bottom: 26rpx;
			}

			.info {
				padding: 20rpx 0;
			}

			.edit {
				.t {
					padding-bottom: 36rpx;
					display: flex;
					align-items: center;
					justify-content: flex-end;

					.wz {
						width: 14px;
						height: 15.5px;
					}

					.close {
						width: 18px;
						height: 15px;
						margin-left: 20rpx;
					}

				}

				.b {
					display: flex;
					align-items: center;
					justify-content: space-between;
					min-width: 70px;
				}
			}

		}
	}

	.icon {
		display: flex;
		flex-flow: column;
		align-items: center;

		.leiting {
			width: 12px;
			height: 18px;
			background-image: url('/static/svg/leiting.svg');
			background-size: cover;
		}

		.lighting {
			background-image: url('/static/svg/lighting.svg') !important;
		}

		.dianliang {
			width: 18px;
			height: 10px;
			background-image: url('/static/svg/dianliang.svg');
			background-size: cover;
		}

		.battery {
			background-image: url('/static/svg/battery.svg') !important;
		}

	}

	.nodevice {
		width: 100%;
		display: flex;
		justify-content: center;
		flex-flow: column;
		align-items: center;

		image {
			width: 40%;
			margin-bottom: 30rpx;
		}
	}

	.operate {
		display: flex;

		.btn {
			width: 50%;
			display: flex;
			flex-flow: column;
			align-items: center;
			position: relative;

			view {
				position: absolute;
				z-index: 999;
				width: 120px;
				height: 140px;
				display: flex;
				align-items: flex-end;
				justify-content: center;
				top: calc(50% - 50px);
				padding-right: 25px;
			}

			.find {
				padding-right: unset;
				padding-left: 25px;
			}
		}

	}
</style>