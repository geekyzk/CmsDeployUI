import request from '@/utils/request'

export function listSystemMainMenu(params) {
  return request({
    url: '/api/systemMainMenu',
    method: 'get',
    params: params
  })
}

export function createSystemMainMenu(data) {
  return request({
    url: '/api/systemMainMenu',
    method: 'post',
    data: data
  })
}

export function updateSystemMainMenu(id, data) {
  return request({
    url: '/api/systemMainMenu/' + id,
    method: 'put',
    data: data
  })
}

export function deleteSystemMainMenu(id) {
  return request({
    url: '/api/systemMainMenu/' + id,
    method: 'delete'
  })
}
