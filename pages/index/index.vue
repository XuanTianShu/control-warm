<template>
  <view class="container">

   <topbar leftText="HiWarm"></topbar>
   
   <view class="_img">
	  <u-swiper :list="list" :height="180"  ></u-swiper>
   </view>
   
   <view class="nodevice font" v-if="deviceList.length==0">
		<image src="@/static/image/not.png" mode="widthFix"></image>
		{{$t('index.no-device')}}
   </view>
   
   <scroll-view v-else>
	   <view class="device bgc" v-for="(item,index) in deviceList" :key="index">
		   <!-- 点击连接蓝牙 -->
	   		<view class="icon" @click="connect(item)">
	   			<view class="leiting" :class="0?'lighting':''"></view>
	   			<lj  :rotate="0" :diameter="30" ></lj>
	   			<view  class="dianliang" :class="0?'battery':''" ></view>
	   		</view>
	   		<view class="deviceInfo">
				<!-- 点击连接蓝牙 -->
	   			<view class="info" @click="connect(item)">
					<p v-if="item.deviceId!=$store.state.connectId" style="font-size: 36px;">--</p>
					<p v-else>60.2℃</p>
	   				<span>{{item.name}}</span>
	   			</view>
	   			<view class="edit">
					<!-- 断开蓝牙 -->
	   				<view class="t" @click="close(item.deviceId)">
	   					<image class="wz" :src="item.deviceId==$store.state.connectId?baseSrc+'icon/b.png':baseSrc+'icon/c.png'" mode="widthFix"></image>
	   					<image  class="close" :src="item.deviceId==$store.state.connectId?baseSrc+'icon/e.png':baseSrc+'icon/a.png'" mode="widthFix"></image>
	   				</view>
					<!-- 加热开关 -->
	   				<view class="b">
	   					{{item.deviceId==$store.state.connectId?'off':'on'}}
	   					<u-switch v-model="switchOpen" active-color="#FD7311" :size='20' inactive-color="#282B2E"></u-switch>
	   				</view>
	   			</view>
	   		</view>
	   		
	   </view>
   </scroll-view>
   
   <view class="operate font">
		<view class="btn" >
			<image src="@/static/image/find.png" mode="aspectFit" >
			</image>
			<view class="find" @click="goTo('/pages/findBlue/findBlue')">{{$t('index.search')}}</view>
		</view>
		<view class="btn">
			<image src="@/static/image/control.png" mode="aspectFit">
			</image>
			<view @click="goTo('/pages/device/device')">{{$t('index.control')}}</view>
		</view>
   </view>
   
  </view>
</template>

<script>
	import  lj from '@/components/lj-chart.vue';
	import {imgList,add,oldDevice } from '@/api/index.js';
  export default {
    data() {
      return {
		switchOpen:true,
		list: ['../../static/image/demo1.png'],
		deviceList:[]
      }
    },
	onLoad() {
		this.init()
	},
	components:{
		lj
	},
    methods: {
		 init(){
			this.deviceList=this.$store.state.device
			this.handlerConnect()
			this.getImg()
			this.getOldDevice()
		},
		// 初始化图片
		async getImg(){
			let res=await imgList()
			if(res.rows.length>0){
				res.rows.forEach(item=>{
					if(item.typetext=='轮播图'){
						this.list.push(item.src)
					}else{
						if('en'==uni.getLocale()){
							if(item.typetext=='使用介绍（en）'){
								this.$store.state.bgimg=item.src
							}
						}
						if('zh'==uni.getLocale()){
							if(item.typetext=='使用介绍（zh）'){
								this.$store.state.bgimg=item.src
							}
						}
					}
				})
			}
			
		},
		// 保存设备记录
		async uploadDeviceInfo(device){
			// let obj={
			//  	deviceId:'456789321',
			//  	  unit:'℃',
			//  	  temperature:28,
			//  	  bait:'左',
			//  	  language:'中文',
			//  	  second:0,
			//  	  heat:'开',
			// 	  mac:'12:1:12:1',
			// 	  name:'HiWarm001'
			//  }
			let res=await add(device)
		},
		// 历史设备
		async getOldDevice(){
			let res=await oldDevice()
			this.$store.state.device=res.data
			this.deviceList=res.data
		},
		// 连接设备
		connect(obj){
			let that=this
			
			if(that.$store.state.connectId){
				that.close(that.$store.state.connectId)
			}
			uni.openBluetoothAdapter({
			  success(res) {
				  console.log('初始化蓝牙',obj);
				  setTimeout(()=>{
					  that.connectBLE(obj.deviceId)
				  },200)
			  },
			  fail(res) {
				 console.log('初始化失败',res);
				 uni.showToast({
				 	title:'蓝牙连接失败',
					icon:'none'
				 })
			  }
			})
		},
		// 连接蓝牙
		connectBLE(deviceId){
			let that=this
			uni.createBLEConnection({
			  deviceId,
			  success(res) {
			    console.log(res)
			  },
			  fail(res) {
			  		console.error('蓝牙连接fail：',res);
			  }
			})

		},
		// 断开连接
		close(deviceId){
			uni.closeBLEConnection({
			  deviceId,
			  success(res) {
			    console.log(res)
			  }
			})
		},
		// 监听连接
		handlerConnect(){
			let that =this
			uni.onBLEConnectionStateChange(function (res) {
			  // 该方法回调中可以用于处理连接意外断开等异常情况
			  console.log(`device: ${res.deviceId} , connected: ${res.connected}`)
			  if(res.connected){
				  that.$store.state.connectId=res.deviceId
				  // 获取所有特征服务
				  setTimeout(()=>{
				  	that.getBlueService(res.deviceId)
				  },200)
				  
				  // that.deviceList.every((value, index, array) => {
				  //   if (value.deviceId == res.deviceId) {  
					 //  // 上传记录
					 //  that.uploadDeviceInfo(value)  
				  //     return false; 
				  //   }  
				  //   return true;  
				  // });
			  } else{
				  that.$store.state.connectId=''
			  }
			})
		},
		// 获取蓝牙 uuid
		getBlueService(deviceId){
			uni.getBLEDeviceServices({
			  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			  deviceId,
			  success(res) {
			    console.error('services:', res.services)
			  }
			})
		},
	
		goTo(url){
			uni.navigateTo({
				url: url
			})
		},

	
    }
  }
</script>

<style lang="less" scoped>

._img{
	border-radius: 20rpx;
	overflow: hidden;
	margin: 30rpx 0;
}

.device{
	margin-top: 20rpx;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	border-radius: 20rpx;
	.deviceInfo{
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
		span{
			padding-left: 10rpx;
		}
		p{
			font-family: PingFang SC;
			font-size: 30px;
			letter-spacing: 0em;
			color: #D3D3D3;
			margin-bottom: 26rpx;
		}
		.info{
			padding: 20rpx 0;
		}
		.edit{
			.t{
				padding-bottom: 36rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				.wz{
					width: 14px;height: 15.5px;
				}
				.close{
					width: 18px;height: 15px;
					margin-left: 20rpx;
				}
					
			}
			.b{
				display: flex;
				align-items: center;
				justify-content: space-between;
				min-width: 70px;
			}
		}
		
	}
}
.icon{
		display: flex;
		flex-flow: column;
		align-items: center;
		
		.leiting{
			width: 12px;
			height: 18px;
			background-image: url('/static/svg/leiting.svg');
			background-size: cover;
		}
		.lighting{
			background-image: url('/static/svg/lighting.svg') !important;
		}
		.dianliang{
			width: 18px;
			height: 10px;
			background-image: url('/static/svg/dianliang.svg');
			background-size: cover;
		}
		.battery{
			background-image: url('/static/svg/battery.svg') !important;
		}
		
	}
.nodevice{
	width: 100%;
	display: flex;justify-content: center;
	flex-flow: column;
	align-items: center;
	image{
		width: 40%;
		margin-bottom: 30rpx;
	}
}
.operate{
	display: flex;
	margin-top: 30px;	
	.btn{
		width: 50%;
		display: flex;
		flex-flow: column;
		align-items: center;
		position: relative;
		view{
			position: absolute;
			z-index: 999;
			width: 120px;
			height:140px;
			display: flex;
			align-items: flex-end;
			justify-content: center;
			top: calc(50% - 50px);
			padding-right: 25px;
		}
		.find{
			padding-right: unset;
			padding-left: 25px;
		}
	}
	
}
</style>
