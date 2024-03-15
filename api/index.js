import request from '@/utils/request'
// 设置
export const add = data => request.post('system/deviceSet/add', data)
// 设置
export const oldDevice = data => request.get('system/deviceSet/oldDevice')
// 图片列表
export const imgList = data => request.get('system/img/banner')