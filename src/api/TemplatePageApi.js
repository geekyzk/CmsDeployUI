import request from '@/utils/request'

export function listTemplatePage(params) {
  return request({
    url: '/api/templatePage',
    method: 'get',
    params: params
  })
}

export function createTemplatePage(data) {
  return request({
    url: '/api/templatePage',
    method: 'post',
    data: data
  })
}

export function updateTemplatePage(id, data) {
  return request({
    url: '/api/templatePage/' + id,
    method: 'put',
    data: data
  })
}

export function deleteTemplatePage(id) {
  return request({
    url: '/api/templatePage/' + id,
    method: 'delete'
  })
}
