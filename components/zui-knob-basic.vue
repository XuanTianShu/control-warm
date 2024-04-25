<template>
	<view class="zui-knob-basic">
		<view ref="eleWrapper" :class="{ 'zui-knob-basic-wrapper': 1, debug }" :style="style">
			<div class="background">
				<canvas class="circlefCanvas" canvas-id="circlefCanvas" id="circlefCanvas"></canvas>

			</div>
			<div class="handle" @touchstart.prevent="dragStart" @touchmove.prevent="dragMoving"
				@touchcancel.prevent="dragCancel" @touchend.prevent="dragEnd">
				<view class="knob-img" :class="isipad?'knob':''">
					<image v-show="show" class="_img" src="@/static/icon/tod.png" mode="aspectFit" />
				</view>
			</div>
		</view>
	</view>
</template>

<script>
	const TWO_PI = 2 * Math.PI;
	export default {
		props: {
			/**
			 * 组件尺寸
			 */
			size: {
				type: Number,
				default: 150,
			},

			/**
			 * 旋钮大小
			 *
			 * [0, 1]  以组件尺寸大小的百分比
			 * [44, ]  像素大小
			 */
			knobSize: {
				type: Number,
				default: 0.8,
			},

			/**
			 * 默认位置
			 */
			position: {
				type: Number,
				default: 0,
			},
			/**
			 * 开启 debug 模式
			 */
			debug: Boolean,
		},

		data() {
			return {
				centerX: 0,
				centerY: 0,
				fixUniHead: 0,
				direction: "none",
				// 防止事件过于频繁触发
				_eventLock: false,
				rotateDeleta: 0,
				schedule: this.position,
				currentPos: this.position,
				draging: false,
				prevRotate: 0,
				attachSide: "none",
				value: this.position,
				isipad: false,
				show: true,
			};
		},
		computed: {
			/**
			 * 是否有限定范围, 默认 360 度
			 */
			hasRange() {
				const val = this.range;
				if (!val) return false;
				if (!val instanceof Array) return false;
				if (typeof val[0] !== "number" || typeof val[1] !== "number")
					return false;

				return val[0] >= 0 && val[0] <= 360 && val[1] >= 0 && val[1] <= 360;
			},

			knobSizeFixed() {
				if (this.knobSize <= 1) return this.knobSize * this.size;

				return this.knobSize;
			},

			startFixed() {
				const range = this.range || [0, 360]
				return range[0];
			},

			endFixed() {
				const range = this.range || [0, 360]
				if (range[1] < range[0]) return range[1] + 360;
				return range[1];
			},

			positionFixed() {
				let pos = this.currentPos + this.rotateDeleta;
				if (this.hasRange) {
					if (pos < this.startFixed) {
						pos = this.startFixed;
					} else if (pos > this.endFixed) {
						pos = this.endFixed;
					}
				}
				return pos;
			},

			style() {
				const style = {
					width: `${this.size}px`,
					height: `${this.size}px`,
					"--zui-knob-basic-size": `${this.size}px`,
					"--zui-knob-handle-rotate": `rotate(${this.positionFixed}deg)`,
					"--zui-knob-handle-size": `${this.knobSizeFixed}px`,
				};

				return Object.keys(style)
					.map((key) => `${key}:${style[key]}`)
					.join(";");
			},
		},

		watch: {
			schedule(nd) {
				this.circleCanvas()
			},
			position(np) {
				const anglePos = (this.endFixed - this.startFixed) * np + this.startFixed;
				this.currentPos = anglePos;
				this.$nextTick(() => {
					this.updatePosition();
				});
			},

		},

		mounted() {
			// 环形进度
			this.circleCanvas()

			const systemInfo = uni.getSystemInfoSync();
			const model = systemInfo.model;
			if (model.includes('iPad')) {
				this.isipad = true
			}
			this.updateCenter();
			this.updatePosition();
		},

		methods: {

			circleCanvas() {
				const ctx = uni.createCanvasContext('circlefCanvas')
				let end = (this.schedule / 360) * 2 * Math.PI; //设置弧度
				let x = this.size / 2,
					y = x;

				ctx.setLineCap('round'); // 设置圆环端点的形状  圆角
				ctx.beginPath(); // 开始一个新的路径
				ctx.setLineWidth(20); // 设置圆环的宽度
				ctx.setStrokeStyle('#090909'); // 设置圆环的颜色
				ctx.arc(x, y, 110, 0, 2 * Math.PI); // 绘制完整的圆环
				ctx.stroke(); // 对当前路径进行描边

				ctx.beginPath(); // 开始另一个新的路径
				ctx.setStrokeStyle('#F46E10'); // 设置圆环的颜色
				ctx.arc(x, y, 110, 0, end, false); // 绘制圆环的一部分
				ctx.stroke();

				ctx.draw();

			},

			updateCenter() {
				// #ifdef H5
				const rect = this.$refs.eleWrapper.$el.getBoundingClientRect();
				this.centerX = rect.left + rect.width / 2;
				this.centerY = rect.top + rect.height / 2;

				if (typeof document !== "undefined") {
					const head = document.querySelector(".uni-page-head");
					this.fixUniHead = !!head ? 44 : 0;
				}
				// #endif

				// #ifndef H5
				const query = uni.createSelectorQuery().in(this);
				query
					.select(".zui-knob-basic-wrapper")
					.fields({
						size: true,
						rect: true
					})
					.exec((rst) => {
						if (!rst) return;
						if (!rst[0]) return;
						this.centerX = rst[0].left + rst[0].width / 2;
						this.centerY = rst[0].top + rst[0].height / 2;
					});
				// #endif
			},

			updatePosition() {
				if (this.hasRange) {
					this.currentPos = this.positionFixed;
				}
			},

			tickCount(count) {
				if (count === 0) {
					this.skipCalc = false;
					return;
				}

				this.$nextTick(() => {
					this.tickCount(count--);
				});
			},

			calucateAngle(nx, ny) {
				const dx = nx - this.centerX;
				const dy = ny - this.centerY;
				const radius = Math.sqrt(dx * dx + dy * dy);
				const radian = (Math.atan2(dy, dx) + TWO_PI) % TWO_PI;
				let degree = ((radian * 180) / Math.PI + 360) % 360;

				const state = {
					radius,
					radian,
					degree,
				};

				let direction = uni.getStorageSync('direction')
				//翻转
				if (!direction) {
					degree = 180 - degree
				}

				this.rotate = degree;
				this.radius = radius;

				if (this.rotateDeleta === 0) {
					this.prevRotate = degree;
					this.rotateDeleta = 0.00000001;
				}
				let diff = degree - this.prevRotate;
				// 跨 0 度轴处理
				if (diff < -90) {
					diff += 360;
				} else if (diff > 90) {
					diff -= 360;
				}
				this.prevRotate = degree;

				// 旋转角度
				let rotate = this.rotateDeleta + diff + this.value
				// 限制进度
				if (rotate >= 0 && rotate < 200) {
					if (rotate > 270) {
						this.show = false
						rotate = 270
					} else {
						this.show = true

					}
					this.schedule = rotate
					this.rotateDeleta = this.rotateDeleta + diff;
					// 大齿轮转动
					this.$emit("run", Math.round(rotate));
					// console.error(this.rotateDeleta);
				}

				state.deleta = this.rotateDeleta;
				state.diff = diff;
				state.direction = diff >= 0 ? "clockwise" : "counterclockwise";
				return state;
			},

			dragStart(evt) {
				this.draging = true;
				this.prevRotate = this.rotate;
				this.rotateDeleta = 0;
			},

			dragMoving(evt) {
				const change = this.calucateAngle(
					evt.touches[0].clientX,
					evt.touches[0].clientY + this.fixUniHead
				);

				if (this.direction !== change.direction) {
					this.direction = change.direction;
				}
			},

			dragCancel() {
				this.reset();
			},

			dragEnd() {
				this.value = this.rotateDeleta + this.value
				this.$emit("change", this.value.toFixed(0));
				this.reset();
			},

			reset() {
				this.currentPos = this.currentPos + this.rotateDeleta;
				this.rotateDeleta = 0;
				this.draging = false;
			},


		},
	};
</script>

<style scoped>
	.zui-knob-basic {
		position: relative;
		border-radius: 50%;
		display: flex;
	}

	.zui-knob-basic-wrapper {
		position: relative;
	}

	.zui-knob-basic-wrapper .background {
		position: absolute;
		top: var(--zui-knob-basic-arrow-size);
		left: var(--zui-knob-basic-arrow-size);
		width: var(--zui-knob-basic-size);
		height: var(--zui-knob-basic-size);
		border-radius: 50%;
		box-sizing: border-box;
		/* border: 1px solid #FFF; */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.circlefCanvas {
		width: var(--zui-knob-basic-size);
		height: var(--zui-knob-basic-size);
		/* transform: rotate(180deg); */
		transform: rotate(110deg);
	}

	.base-img {
		width: var(--zui-knob-basic-size);
		height: var(--zui-knob-basic-size);
		position: relative;
	}


	.handle {
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		transform-origin: center;
		transform: var(--zui-knob-handle-rotate, rotate(0));
	}



	.knob-img {
		width: var(--zui-knob-handle-size);
		height: var(--zui-knob-handle-size);
		transform: rotate(-70deg);
	}

	._img {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		top: 50%;
		transform: translate(30%, -55%);
	}

	.hint-img {
		width: var(--zui-knob-basic-hint-size);
		height: var(--zui-knob-basic-hint-size);
	}
</style>
