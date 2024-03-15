<template>
	<view class="container">
		<topbar :righticon='false'></topbar>

		<view v-for="(item,index) in list" :key="index">
			<p>{{item.title}}</p>
			<view class="checkBox">
				<view @click="handlerClick(index,0)" class="btn"
					:class="item.idx==0?'onCheck': index!=list.length-1?'notright':''">
					<image v-if="index==list.length-1" src="../../static/icon/r.png" mode="widthFix"></image>
					{{item.btn[0]}}
				</view>
				<view @click="handlerClick(index,1)" v-if="item.btn[1]" class="btn"
					:class="item.idx==1?'onCheck':'notleft'">
					{{item.btn[1]}}
				</view>
			</view>

		</view>

		<view class="version">
			V1.1.0
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: []
			}
		},
		onShow() {
			this.list = uni.getStorageSync('settings')
		},
		methods: {

			handlerClick(index, idx) {
				if (index < this.list.length - 1) {
					this.list[index].idx = idx
					uni.setStorageSync('settings', this.list);

					switch (index) {
						case 0:
							this.setunit(idx);
							break;
						case 1:
							this.setdirection(idx);
							break;
						case 2:
							this.setlanguage(idx);
							break;
					}

				} else {
					uni.navigateTo({
						url: '/pages/explain/introduce'
					})
				}
			},
			// 语言
			setlanguage(index) {
				let code = 'zh-Hans';
				if (index) {
					code = 'en'
				}
				if (code != uni.getLocale()) {
					let systemInfo = uni.getSystemInfoSync();
					const isAndroid = systemInfo.platform.toLowerCase() === 'android';
					if (isAndroid) {
						uni.showModal({
							content: this.$t('index.language-change-confirm'),
							success: (res) => {
								if (res.confirm) {
									uni.setLocale(code);
								}
							}
						})
					} else {
						uni.setLocale(code);
						this.$i18n.locale = code;
					}
					this.init()
				}
			},
			// 单位
			setunit() {

			},
			// 左右
			setdirection(index) {
				uni.setStorageSync('direction', index)
			},
		}
	}
</script>

<style lang="scss" scoped>
	image {
		width: 17px;
		height: 14px;
		margin-right: 16rpx;
	}

	p {
		margin-top: 30px;
		text-align: center;
		font-size: 18px;
	}

	.version {
		position: absolute;
		bottom: 2%;
		width: 90%;
		text-align: center;
		font-size: 15px;
		line-height: 25px;
		letter-spacing: 0px;
		color: #636363;
	}

	.onCheck {
		color: #FD7311 !important;
		border: 1px solid #FD7311 !important;
		background-color: #372C25;
	}

	.notright {
		border-right: transparent !important;
	}

	.notleft {
		border-left: transparent !important;
	}

	.checkBox {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 272px;
		margin: 0 auto;
		margin-top: 20rpx;

		.btn {
			text-align: center;
			width: 136px;
			height: 46px;
			line-height: 46px;
			border: 0.5px solid #999999;
			color: #787878;
		}

		.btn:first-child {
			border-top-left-radius: 60rpx;
			border-bottom-left-radius: 60rpx;
		}

		.btn:last-child {
			border-top-right-radius: 60rpx;
			border-bottom-right-radius: 60rpx;
		}
	}

	.checkBox:last-child {
		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			border: 0.5px solid #999999;
		}
	}
</style>