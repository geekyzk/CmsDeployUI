import request from '@/utils/request'

export function listNewsData(params) {
  return request({
    url: '/api/newsData',
    method: 'get',
    params: params
  })
}

export function createNewsData(data) {
  return request({
    url: '/api/newsData',
    method: 'post',
    data: data
  })
}

export function updateNewsData(id, data) {
  return request({
    url: '/api/newsData/' + id,
    method: 'put',
    data: data
  })
}

export function deleteNewsData(id) {
  return request({
    url: '/api/newsData/' + id,
    method: 'delete'
  })
}
