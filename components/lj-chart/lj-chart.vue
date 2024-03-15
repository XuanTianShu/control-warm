<template>
	<div class="containerring" id="circle" :style="{'background': color,'width':handleSize,'height':handleSize}"> 
		　<div class="leftring">
			<div class="left" :style="{'background': ringtrackcolor,'border-radius':handRadius('l'), 'transform':`${renderLeft()}`}"></div>
		</div>
		<div class="rightring">
			<div class="right" :style="{'background': ringtrackcolor,'border-radius':handRadius('r'),'transform':`${renderRight()}`}"></div>
		</div>
		<!-- <div class="proportion" :style="{'width':mw,'height':mw}">{{rotate}}%</div> -->
		<image @click="edit" class="_img"  src="@/static/svg/clock.svg" mode="widthFix" ></image>
	</div>
</template>
<script>
	export default {
		name: "lj-chart",
		props: {
			color: { //环状图颜色
				type: String,
				default: '#FD7311'
			},
			diameter: { //进度条宽度
				type: Number,
				default: 40
			},
			ringtrackcolor: { //环状图轨道颜色
				type: String,
				default: '#58595B'
			},
			rotate: {
				type: String | Number,
				default: 19
			},
			size: { //容器大小
				type: Number,
				default: 18
			},
			url:{
				type:String,
				default:''
			}
		},
		
		data() {
			return {
				getBoxW: null
			};
		},
		computed: {
			mw() {
				const makeW = `${this.getBoxW?.width - this.diameter}px`
				return makeW
			},
			handleSize(){
				const hSize = `${this.size}px`
				return hSize
			},
			
		},
		methods: {
			edit(){
				console.log('eeeee');
				this.$emit('demo',2)
			},
			
			async init() {
				this.getBoxW = await this.getBox()
			},
			async getBox() {
				let obj = null
				return new Promise(resolve => {
					const query = uni.createSelectorQuery().in(this);
					query.select(`#circle`).boundingClientRect(data => {
						obj = data
					}).exec(() => {
						resolve(obj);
					});
				})
			},
			handRadius(type){
				let htm = ``
				const bSize = `${this.size/2}px`
				if(type == 'l'){
					htm = `${bSize} 0 0 ${bSize}`
				}else{
					htm = `0 ${bSize} ${bSize} 0`
				}
				return htm
			},
			renderLeft() {
				let rotateNum = this.rotate * 3.6;
				if (rotateNum <= 180) {
					return `rotate(${0}deg)`
				} else {
					return `rotate(${(rotateNum-180)}deg)`
				}
			},
			renderRight() {
				let rotateNum = this.rotate * 3.6;
				if (rotateNum <= 180) {
					return `rotate(${rotateNum}deg)`
				} else {
					return `rotate(${180}deg)`
				}

			},
		},
		mounted() {
			this.init()
		}
	}
</script>

<style lang="scss">
	.containerring {
		position: relative;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 16rpx 0;
		.leftring {
			width: 50.6%;
			height: 100%;
			margin: 0px;
			position: absolute;
			left: -0.4%;
			top: 0;
			overflow: hidden;
		}

		.rightring {
			width: 50.6%;
			height: 100%;
			margin: 0px;
			position: absolute;
			right: -0.4%;
			top: 0;
			overflow: hidden;
		}
		.left {
			width: 100%;
			height: 100%;
			border-radius: 55px 0 0 55px;
			transform-origin: right center;
		}
		
		.right {
			width: 100%;
			height: 100%;
			border-radius: 0 55px 55px 0;
			transform-origin: left center;
		}
		._img{
			width: 14px;
			background-color:rgba(31, 31, 31, 1.0);
			border-radius: 50%;
			z-index: 99;
			
		}
		.proportion {
			position: absolute;
			top: 50%;
			left: 50%;
			transform:translate(-50%,-50%);
			background: #58595B;
			border-radius: 50%;
			padding: 14px;
			box-sizing: border-box;
			text-align: center;
		}
	}


	

	
</style>
