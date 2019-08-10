import request from '@/utils/request'

export function listSystemParam(params) {
  return request({
    url: '/api/systemParam',
    method: 'get',
    params: params,
    baseURL: process.env.BASE_API
  })
}

export function createSystemParam(data) {
  return request({
    url: '/api/systemParam',
    method: 'post',
    data: data,
    baseURL: process.env.BASE_API
  })
}

export function updateSystemParam(id, data) {
  return request({
    url: '/api/systemParam/' + id,
    method: 'put',
    data: data,
    baseURL: process.env.BASE_API
  })
}

export function deleteSystemParam(id) {
  return request({
    url: '/api/systemParam/' + id,
    method: 'delete',
    baseURL: process.env.BASE_API
  })
}
