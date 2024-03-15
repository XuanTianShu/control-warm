import cfg from '@/config/index' //获取请求域名

const baseRequest = async (url, method, data = {}, loading = true) => {
	return new Promise((reslove, reject) => {
		uni.request({
			url: cfg.baseUrl + url,
			method: method || 'GET',
			timeout: 5000,
			data: data || {},
			success: (res) => {
				if (res.data.code == 200) {
					reslove(res.data)
				} else {
					uni.showToast({
						title: res.data.msg,
						duration: 2000,
						icon: 'none'
					})
					reject(res.data.msg)
				}
			},
			fail: (err) => {
				reject(err)

			}
		})
	})
}

const request = {}
const arr = ['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect']
arr.forEach(method => {
	request[method] = (api, data, loading) => baseRequest(api, method, data, loading)
})

export default request