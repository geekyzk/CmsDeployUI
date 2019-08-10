import request from '@/utils/request'

export function listSystemBlackUser(params) {
  return request({
    url: '/api/systemBlackUser',
    method: 'get',
    params: params
  })
}

export function createSystemBlackUser(data) {
  return request({
    url: '/api/systemBlackUser',
    method: 'post',
    data: data
  })
}

export function updateSystemBlackUser(id, data) {
  return request({
    url: '/api/systemBlackUser/' + id,
    method: 'put',
    data: data
  })
}

export function deleteSystemBlackUser(id) {
  return request({
    url: '/api/systemBlackUser/' + id,
    method: 'delete'
  })
}
