import request from '@/utils/request'

export function listNews(params) {
  return request({
    url: '/api/news',
    method: 'get',
    params: params
  })
}

export function createNews(data) {
  return request({
    url: '/api/news',
    method: 'post',
    data: data
  })
}

export function updateNews(id, data) {
  return request({
    url: '/api/news/' + id,
    method: 'put',
    data: data
  })
}

export function deleteNews(id) {
  return request({
    url: '/api/news/' + id,
    method: 'delete'
  })
}
