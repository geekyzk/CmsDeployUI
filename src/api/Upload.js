import request from '@/utils/request'

export function uploadFile(form) {
  return request({
    url: '/api/upload',
    method: 'post',
    data: form
  })
}
