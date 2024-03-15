<template>
	<view class="container">
		<topbar></topbar>
		<view class="title bgc">
			<image src="../../static/icon/b.png"></image>
			<span class="font">HiWarm</span>
		</view>

		<!-- 温度控制 -->
		<!-- 0左 1右 -->
		<view class="content" :style="{transform:direction?'':'scaleX(-1)'}">
			<image class="little" src="../../static/image/littlegear.png" mode="widthFix"></image>
			<image class="mini" src="../../static/image/minigear.png" mode="widthFix"></image>
			<image class="gear" :style="{
				animation:t?'unset':'',
				transform:'rotate('+runing+'deg)'}" src="../../static/image/gear.png" mode="widthFix">
			</image>
			<view class="ring">
				<zuiknobbasic @run="run" :modelValue='50' @change='change' :position='temperature' :size='310' />
			</view>
			<view class="c" :style="{
					transform:direction?'':'scaleX(-1)',
					'text-align':direction?'left':'right'
					}">
				{{ 1? $t('device.celsius') :  $t('device.fahrenheit') }}
				<!-- 限制最大角度200 -->
				<p>{{(20+40*runing/200).toFixed(1)}}</p>
				<view class="btnImg" :class="$store.state.isConnect?'btnColor':''">
					<image :src="$store.state.isConnect?'../../static/icon/heat.png':'../../static/svg/leiting.svg'">
					</image>
					{{$t('device.heat') }}
				</view>

			</view>
		</view>
		<!-- 模式控制 -->
		<!-- 0左 1右 -->
		<view class="u-flex" :class="direction?'':'u-row-right'">
			<!-- <view :style="{display:'flex',justifyContent:!direction?'':'flex-end'}"> -->
			<view class="edit">
				<view class="btn" @click="setMode(1)" :class="btn==1?'btn-click':''">
					<image :src="btn==1?'../../static/icon/thermometer.png':'../../static/icon/t.png'"></image>
					{{$t('device.degree-1')}}
				</view>
				<view class="btn" @click="setMode(2)" :class="btn==2?'btn-click':''">
					<image :src="btn==2?'../../static/icon/thermometer.png':'../../static/icon/t.png'"></image>
					{{$t('device.degree-2')}}
				</view>
				<view class="btn" @click="setMode(3)" :class="btn==3?'btn-click':''">
					<image :src="btn==3?'../../static/icon/thermometer.png':'../../static/icon/t.png'"></image>
					{{$t('device.degree-3')}}
				</view>
			</view>
		</view>
		<!-- 时间控制 -->
		<view class="tod">
			<p>off</p>
			<view class="t_img">
				<view id="schedule" :style="{width:width+'px','margin-left':width?'2px':''}"></view>
				<image id="todTime" @touchstart="todStart" @touchmove="todmove" @touchend="todend"
					src="../../static/icon/tod.png" mode="widthFix"></image>
			</view>
			<view class="timer">
				<view :id="'item'+index" v-for="(item,index) in timer" :key="index">
					{{item}}
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import zuiknobbasic from '@/components/zui-knob-basic.vue'
	export default {
		data() {
			return {
				timer: ['0', '15m', '30m', '45m', '1H', '1.5H', '2H'],
				query: '',
				todWidth: '',
				width: '',
				height: '',
				left: '',
				temperature: 0,
				direction: 1,
				runing: 0,
				t: false,
				btn: 1,
				deviceId: '',
				serviceId: '',
				uuid: '',
				isConnect: true
			}
		},
		components: {
			zuiknobbasic
		},

		watch: {
			// 左右变化
			direction(newdata) {
				let olddata = uni.getStorageSync('olddirection')

				if (newdata != olddata) {
					uni.setStorageSync('olddirection', newdata)
					uni.redirectTo({
						url: '/pages/device/device?run=' + this.runing
					})

				}
			},
			isConnect(e) {
				if (!e) {
					uni.showToast({
						title: '蓝牙关闭',
						icon: 'error'
					})
					// setTimeout(() => {
					// 	uni.navigateBack()
					// }, 1300)
				}
			}
		},
		onLoad(e) {
			if (e.run) {
				let n = Math.round(e.run)
				if (n < 0) n = 0;
				this.temperature = n
				this.runing = this.temperature
			}
			const query = uni.createSelectorQuery().in(this);
			this.query = query
			const {
				screenWidth
			} = uni.getSystemInfoSync();
			this.todWidth = screenWidth - 60
			this.handlerConnect()
		},
		onShow() {
			let d = uni.getStorageSync('direction')
			this.direction = d

			if (this.$store.state.device) {
				this.deviceId = this.$store.state.device.deviceId
				this.serviceId = this.$store.state.device.serviceId
				this.uuid = this.$store.state.device.uuid
				this.notify(this.$store.state.device.characteristicId)
			}
			this.isConnect = this.$store.state.isConnect
		},
		methods: {
			todStart(e, index) {},
			todmove(e) {
				const pageX = e.touches[0].pageX;
				if (pageX > this.todWidth) {
					this.width = this.todWidth - 18
				} else {
					this.width = pageX - 11
				}
				if (pageX <= 20) {
					this.width = 0
				}

			},
			// 时间控制器
			async todend(e, index) {
				const pageX = this.width
				// 计算timer位置
				let aw = Math.round((this.todWidth - 4) / (this.timer.length - 1));
				let idx = Math.round(pageX / aw)
				if (idx > this.timer.length - 1) {
					idx = this.timer.length - 1
				}
				this.width = aw * idx - 12
				if (this.width < 0) this.width = 0

				let str = this.timer[idx]
				if (str.indexOf('m') != -1) {
					str = str.replace('m', '')
				}
				if (str.indexOf('H') != -1) {
					str = str.replace('H', '')
					str = parseInt(str) * 60
				}
				let res = await this.write('AA0301' + str + '00')
				if (!res) {
					uni.showToast({
						title: '请重新设置!'
					})
				}
			},
			// 温度控制器
			change(e) {
				console.log(e, '角度');
				this.t = false
			},
			run(e) {
				console.log(e, '旋转');
				this.t = true
				this.runing = e
			},



			async setMode(e) {
				// 低45°中50°高55°
				let res = await this.write('AA0201' + str + '00')
				if (res) this.btn = e
			},
			// 监听
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
			// 发送指令
			write(str) {
				console.log('命令：', str);
				let that = this
				let data = new Uint8Array(str.match(/[\da-f]{2}/gi).map(function(h) {
					return parseInt(h, 16)
				}))

				return new Promise((resolve, reject) => {
					uni.writeBLECharacteristicValue({
						deviceId: that.deviceId,
						serviceId: that.serviceId,
						characteristicId: that.uuid,
						value: data.buffer,
						success(res) {
							console.log('发送成功')
							resolve(true)
						},
						fail(e) {
							console.log('发送失败')
							reject(false)
						}
					})
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
			// 监听蓝牙连接
			handlerConnect() {
				let that = this
				uni.onBLEConnectionStateChange(function(res) {
					// 连接断开
					if (!res.connected) {
						that.$store.state.isConnect = that.isConnect = res.connected
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background: url('../../static/svg/bg.svg');
		background-size: cover;
		background-repeat: no-repeat;
	}

	.tod {
		padding: 15px;

		.t_img {
			background: #202226;
			box-shadow: inset 0px 3.04px 3.04px 0px rgba(0, 0, 0, 0.75), inset -1.52px -1.52px 1.52px 0px #4E5154;
			border-radius: 30rpx;
			height: 10px;
			margin: 10px 0;
			display: flex;
			align-items: center;

			image {
				width: 18px;
				z-index: 999;
			}

			view {
				background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 48%, rgba(255, 255, 255, 0.04) 59%), linear-gradient(91deg, #BF5103 2%, #FD7311 101%);
				border-top-left-radius: 30rpx;
				border-bottom-left-radius: 30rpx;
				height: 4.55px;
			}
		}

		.timer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 21rpx;
			color: #7F8489;
			padding: 0 4px;
		}

		p {
			color: #FD7311;
		}
	}

	.content {
		width: 375px;
		height: 450px;
		margin-left: calc((100% - 375px)/2);
		position: relative;

		.ring {
			position: absolute;
			right: -22%;
			top: 22.5%;
			z-index: 999;
		}

		.little,
		.mini,
		.gear {
			position: absolute;
		}

		.mini {
			width: 94px;
			top: 45%;
			left: 6%;
			animation: gear 24s linear infinite reverse;
		}

		.little {
			width: 217px;
			left: -15%;
			top: 4%;
			animation: gear 24s linear infinite;
		}

		.gear {
			width: 422px;
			top: 10%;
			right: -37%;
			animation: gear 24s linear infinite;
		}

		.c {
			position: absolute;
			z-index: 999;
			bottom: 0;
			left: 30rpx;
			font-size: 13px;
			letter-spacing: -0.08px;
			padding-left: 10rpx;

			p {
				margin: 10rpx 0;
				font-size: 50px;
				letter-spacing: 0.46px;
				text-indent: -3px;
			}

			.btnColor {
				color: #D42B52 !important;
				border: 0.5px solid #D42B52 !important;
			}

			.btnImg {
				width: 94px;
				height: 35px;
				border-radius: 30rpx;
				border: 0.5px solid #787878;
				color: #787878;
				display: flex;
				align-items: center;
				justify-content: center;

				image {
					width: 12px;
					height: 17px;
					margin-right: 16rpx;
				}
			}
		}

	}

	.edit {
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		margin-left: 30rpx;

		.btn:first-child {
			border-top-left-radius: 30rpx;
			border-bottom-left-radius: 30rpx;
		}

		.btn:last-child {
			border-top-right-radius: 30rpx;
			border-bottom-right-radius: 30rpx;
		}

		.btn-click {
			background: #372C25;
			border: 1rpx solid #FD7311 !important;
			color: #FD7311;
			opacity: 1 !important;
		}

		.btn {
			width: 80px;
			height: 32px;
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #787878;
			opacity: 0.5;
		}

		image {
			height: 15px;
			width: 12px;
			margin-right: 10rpx;
		}
	}

	.title {
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 30%;
		padding: 20rpx;
		margin: 20rpx auto;
		border-radius: 10rpx;

		image {
			width: 26rpx;
			height: 30rpx;
		}

		.font {
			font-size: 20px;
			margin-left: 16rpx;
		}
	}

	@keyframes gear {
		0% {
			transform: rotate(360deg);
		}

		100% {
			transform: rotate(0deg);
		}
	}
</style>