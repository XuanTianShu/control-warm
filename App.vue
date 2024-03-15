<style lang="scss">
	* {
		box-sizing: border-box;
	}

	.container {
		padding: 15px;
		overflow-x: hidden;
		color: #FFFFFF;
		min-height: 100vh;
		background: linear-gradient(180deg, #33383D 0%, #1C1C1E 100%);
	}

	.font {
		font-family: PingFangSCMedium-Medium;
		font-size: 14px;
		font-weight: normal;
		line-height: 22px;
		letter-spacing: -0.41px;
		color: #ACACAC;
	}

	.bgc {
		background: rgba(88, 89, 91, 0.5);
	}

	@for $i from 1 through 5 {
		.u-line-#{$i} {
			/* #ifdef APP-NVUE */
			// nvue下，可以直接使用lines属性，这是weex特有样式
			lines: $i;
			text-overflow: ellipsis;
			overflow: hidden;
			flex: 1;
			/* #endif */

			/* #ifndef APP-NVUE */
			// vue下，单行和多行显示省略号需要单独处理
			@if $i =='1' {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}

			@else {
				display: -webkit-box !important;
				overflow: hidden;
				text-overflow: ellipsis;
				word-break: break-all;
				-webkit-line-clamp: $i;
				-webkit-box-orient: vertical !important;
			}

			/* #endif */
		}
	}

	.u-relative,
	.u-rela {
		position: relative;
	}

	.u-absolute,
	.u-abso {
		position: absolute;
	}

	// nvue不能用标签命名样式，不能放在微信组件中，否则微信开发工具会报警告，无法使用标签名当做选择器
	/* #ifndef APP-NVUE */
	image {
		display: inline-block;
	}

	// 在weex，也即nvue中，所有元素默认为border-box
	view,
	text {
		box-sizing: border-box;
	}

	/* #endif */



	.u-flex {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.u-flex-wrap {
		flex-wrap: wrap;
	}

	.u-flex-nowrap {
		flex-wrap: nowrap;
	}

	.u-col-center {
		align-items: center;
	}

	.u-col-top {
		align-items: flex-start;
	}

	.u-col-bottom {
		align-items: flex-end;
	}

	.u-row-center {
		justify-content: center;
	}

	.u-row-left {
		justify-content: flex-start;
	}

	.u-row-right {
		justify-content: flex-end;
	}

	.u-row-between {
		justify-content: space-between;
	}

	.u-row-around {
		justify-content: space-around;
	}

	.u-text-left {
		text-align: left;
	}

	.u-text-center {
		text-align: center;
	}

	.u-text-right {
		text-align: right;
	}

	.u-flex-col {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	// 定义flex等分
	@for $i from 0 through 12 {
		.u-flex-#{$i} {
			flex: $i;
		}
	}

	// 定义字体(px)单位，小于20都为px单位字体
	@for $i from 9 to 20 {
		.u-font-#{$i} {
			font-size: $i + px;
		}
	}

	// 定义字体(rpx)单位，大于或等于20的都为rpx单位字体
	@for $i from 20 through 40 {
		.u-font-#{$i} {
			font-size: $i + rpx;
		}
	}

	// 定义内外边距，历遍1-80
	@for $i from 0 through 80 {

		// 只要双数和能被5除尽的数
		@if $i % 2==0 or $i % 5==0 {

			// 得出：u-margin-30或者u-m-30
			.u-margin-#{$i},
			.u-m-#{$i} {
				margin: $i + rpx !important;
			}

			// 得出：u-padding-30或者u-p-30
			.u-padding-#{$i},
			.u-p-#{$i} {
				padding: $i + rpx !important;
			}

			@each $short,
			$long in l left,
			t top,
			r right,
			b bottom {

				// 缩写版，结果如： u-m-l-30
				// 定义外边距
				.u-m-#{$short}-#{$i} {
					margin-#{$long}: $i + rpx !important;
				}

				// 定义内边距
				.u-p-#{$short}-#{$i} {
					padding-#{$long}: $i + rpx !important;
				}

				// 完整版，结果如：u-margin-left-30
				// 定义外边距
				.u-margin-#{$long}-#{$i} {
					margin-#{$long}: $i + rpx !important;
				}

				// 定义内边距
				.u-padding-#{$long}-#{$i} {
					padding-#{$long}: $i + rpx !important;
				}
			}
		}
	}

	// 重置nvue的默认关于flex的样式
	.u-reset-nvue {
		flex-direction: row;
		align-items: center;
	}



	// 此处加上!important并非随意乱用，而是因为目前*.nvue页面编译到H5时，
	// App.vue的样式会被uni-app的view元素的自带border属性覆盖，导致无效
	// 综上，这是uni-app的缺陷导致我们为了多端兼容，而必须要加上!important
	// 移动端兼容性较好，直接使用0.5px去实现细边框，不使用伪元素形式实现
	.u-border {
		border-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-style: solid;
	}

	.u-border-top {
		border-top-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-top-style: solid;
	}

	.u-border-left {
		border-left-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-left-style: solid;
	}

	.u-border-right {
		border-right-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-right-style: solid;
	}

	.u-border-bottom {
		border-bottom-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-bottom-style: solid;
	}

	.u-border-top-bottom {
		border-top-width: 0.5px !important;
		border-bottom-width: 0.5px !important;
		border-color: $u-border-color !important;
		border-top-style: solid;
		border-bottom-style: solid;
	}

	// 去除button的所有默认样式，让其表现跟普通的view、text元素一样
	.u-reset-button {
		padding: 0;
		background-color: transparent;
		/* #ifndef APP-PLUS */
		font-size: inherit;
		line-height: inherit;
		color: inherit;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-width: 0;
		/* #endif */
	}

	/* #ifndef APP-NVUE */
	.u-reset-button::after {
		border: none;
	}

	/* #endif */

	.u-hover-class {
		opacity: 0.7;
	}
</style>