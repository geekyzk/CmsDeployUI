import request from '@/utils/request'

export function listUserRole(params) {
  return request({
    url: '/api/userRole',
    method: 'get',
    params: params
  })
}

export function createUserRole(data) {
  return request({
    url: '/api/userRole',
    method: 'post',
    data: data
  })
}

export function updateUserRole(id, data) {
  return request({
    url: '/api/userRole/' + id,
    method: 'put',
    data: data
  })
}

export function deleteUserRole(id) {
  return request({
    url: '/api/userRole/' + id,
    method: 'delete'
  })
}
