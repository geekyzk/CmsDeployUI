import request from '@/utils/request'

export function listUserCompany(params) {
  return request({
    url: '/api/userCompany',
    method: 'get',
    params: params,
    baseURL: process.env.BASE_API
  })
}

export function createUserCompany(data) {
  return request({
    url: '/api/userCompany',
    method: 'post',
    data: data,
    baseURL: process.env.BASE_API
  })
}

export function updateUserCompany(id, data) {
  return request({
    url: '/api/userCompany/' + id,
    method: 'put',
    data: data,
    baseURL: process.env.BASE_API
  })
}

export function deleteUserCompany(id) {
  return request({
    url: '/api/userCompany/' + id,
    method: 'delete',
    baseURL: process.env.BASE_API
  })
}
