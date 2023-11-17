<template>
  <view class="container">
		<topbar ></topbar>
		<view class="title bgc">
			<image src="../../static/icon/b.png" ></image>
			<span class="font">HiWarm</span>
		</view>
		

		<!-- 0左 1右 -->
		<view class="content" :style="{transform:!direction?'scaleX(-1)':''}">
			<image class="little" src="../../static/image/littlegear.png" mode="widthFix"></image>
			<image class="mini" src="../../static/image/minigear.png" mode="widthFix"></image>
			<image class="gear" :style="{transform:'rotate('+runing+'deg)'}" src="../../static/image/gear.png" mode="widthFix">
				
			</image>
			<view class="ring">
				<zuiknobbasic @run="run" :modelValue='50' @change='change' 
				:position='temperature' :size='309' />
			</view>
			<view class="c" :style="{transform:!direction?'scaleX(-1)':''}">
				{{ 1? $t('device.celsius') :  $t('device.fahrenheit') }}
				<p>38.5</p>
				<view class="btnImg" :class="0?'btnColor':''">
					<image v-if="0"  src="../../static/icon/heat.png"  ></image>
					<image v-else src="../../static/svg/leiting.svg" ></image>
					{{$t('device.heat') }}
				</view>
			
			</view>
		</view>
		<!-- 0左 1右 -->
		<view :style="{display:'flex',justifyContent:!direction?'flex-end':''}">
			<view class="edit">
				<view class="btn btn-click">
					<image :src="1?'../../static/icon/thermometer.png':'../../static/icon/t.png'" ></image>
					{{$t('device.degree-1')}}
				</view>
				<view class="btn">
					<image :src="0?'../../static/icon/thermometer.png':'../../static/icon/t.png'" ></image>
					{{$t('device.degree-2')}}
				</view>
				<view class="btn">
					<image :src="0?'../../static/icon/thermometer.png':'../../static/icon/t.png'" ></image>
					{{$t('device.degree-3')}}
				</view>
			</view>
		</view>
		<view class="tod">
			<p>off</p>
			<view class="t_img">
				<view id="schedule" :style="{width:width+'px','margin-left':width?'2px':''}"></view>
				<image id="todTime" @touchstart="todStart"  @touchmove="todmove" @touchend="todend"
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
  import zuiknobbasic  from '@/components/zui-knob-basic.vue'
  export default {
    data() {
      return {
			timer:['0','15m','30m','45m','1H','1.5H','2H'],
			query:'',
			todWidth:'',
			width:'',
			height:'',
			left:'',
			temperature:0,
			direction:0,
			runing:0,
      }
    },
	components:{
		zuiknobbasic
	},
    computed:{
      
    },
	watch:{
		direction(newdata){
			let olddata= uni.getStorageSync('olddirection')
			if(newdata != olddata){
				uni.setStorageSync('olddirection',newdata)
				uni.redirectTo({  
					url:'/pages/device/device?run='+this.runing
				})
				
			}
		}
	},
    onLoad(e) {
		if(e.run){
			let n=Math.round(e.run)
			if(n<0) n=0;
			// if(n>180) n=180
			this.temperature=n
			this.runing=this.temperature
		}
		const query = uni.createSelectorQuery().in(this);
		this.query=query
		const { screenWidth } =  uni.getSystemInfoSync();
		this.todWidth=screenWidth-60
    },
	onShow() {
		this.direction= uni.getStorageSync('direction')
		
	},
    methods: {
		todStart(e, index) {},
		todmove(e){
			const pageX = e.touches[0].pageX;
			if(pageX>this.todWidth){
				this.width=this.todWidth-18
			}else{
				this.width=pageX-11
			}
			if(pageX<=20){
				this.width=0
			}
			 
		},
		todend(e, index) {
			const pageX =this.width
			// 计算timer位置
			let aw=Math.round((this.todWidth-4)/(this.timer.length-1));
			let idx=Math.round(pageX/aw)
			if(idx>this.timer.length-1) {
				idx=this.timer.length-1
			}
			this.width=aw*idx-12
			if(this.width<0) this.width=0
			console.log(idx);
		},
		
		change(e){
			console.log(e,'角度');
		},
		run(e){
			console.log(e,'旋转');
			this.runing=e
		}
    }
  }
</script>

<style lang="scss" scoped>
	.container{
		background: url('../../static/svg/bg.svg');
		background-size: cover;
		background-repeat: no-repeat;
	}
	
	.tod{
		padding: 15px;
		
		.t_img{
			background: #202226;
			box-shadow: inset 0px 3.04px 3.04px 0px rgba(0, 0, 0, 0.75),inset -1.52px -1.52px 1.52px 0px #4E5154;
			border-radius: 30rpx;
			height: 10px;
			margin: 10px 0;
			display: flex;
			align-items: center;
			image{
				width: 18px;
				z-index: 999;
			}
			view{
				background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 48%, rgba(255, 255, 255, 0.04) 59%), linear-gradient(91deg, #BF5103 2%, #FD7311 101%);
				border-top-left-radius: 30rpx;
				border-bottom-left-radius: 30rpx;
				height: 4.55px;
			}
		}
		.timer{
			display: flex;
			justify-content:space-between;
			align-items: center;
			font-size: 21rpx;
			color: #7F8489;
			padding: 0 4px;
		}
		p{
			color: #FD7311;
		}
	}

	.content{
		width: 375px;
		height: 450px;
		margin-left: calc((100% - 375px)/2);
		position: relative;
		.ring{
			position: absolute;
			right: -22%;
			top: 22.5%;
			z-index: 999;
		}
	
		.little,.mini,.gear{
			position: absolute;
		}
		.mini{
			width: 94px;
			top: 45%;
			left: 6%;
			animation: gear 24s linear infinite reverse;
		}
		.little{
			width:217px;
			left: -15%;
			top: 4%;
			animation: gear 24s linear infinite ;
		}
		.gear{
			width: 422px;
			top: 10%;
			right: -37%;
		}
		.c{
			position: absolute;
			z-index: 999;
			bottom: 0;
			left: 30rpx;
			font-size: 13px;
			letter-spacing: -0.08px;
			padding-left: 10rpx;
			p{
				margin: 10rpx 0;
				font-size: 50px;
				letter-spacing: 0.46px;
				text-indent: -3px;
			}
			.btnColor{
				color: #D42B52 !important;
				border: 0.5px solid #D42B52 !important;
			}
			.btnImg{
				width: 94px;
				height: 35px;
				border-radius: 30rpx;
				border: 0.5px solid #787878;
				color: #787878;
				display: flex;align-items: center;justify-content: center;
				image{
					width: 12px;
					height: 17px;
					margin-right: 16rpx;
				}
			}
		}
		
	}
	.edit{
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		margin-left: 30rpx;
		.btn:first-child{
			border-top-left-radius: 30rpx;
			border-bottom-left-radius: 30rpx;
		}
		.btn:last-child{
			border-top-right-radius: 30rpx;
			border-bottom-right-radius: 30rpx;
		}
		.btn-click{
			background: #372C25;
			border: 1rpx solid #FD7311 !important;
			color: #FD7311;
			opacity: 1 !important;
		}
		.btn{
			width: 80px;height: 32px;
			display: flex;justify-content: center;align-items: center;
			border: 1rpx solid #787878;
			opacity: 0.5;
		}
		image{
			height: 15px;
			width: 12px;
			margin-right: 10rpx;
		}
	}
	.title{
		display: flex;align-items: center;justify-content: center;
		max-width: 30%;
		padding: 20rpx;
		margin: 20rpx auto;
		border-radius: 10rpx;
		image{
			width: 26rpx;
			height: 30rpx;
		}
		.font{
			font-size: 20px;
			margin-left: 16rpx;
		}
	}

@keyframes gear{
	0% {
	  transform: rotate(360deg);  
	}  
	100% {  
	  transform: rotate(0deg);  
	} 
}
</style>
