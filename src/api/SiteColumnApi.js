import request from '@/utils/request'

export function listSiteColumn(params) {
  return request({
    url: '/api/siteColumn',
    method: 'get',
    params: params
  })
}

export function createSiteColumn(data) {
  return request({
    url: '/api/siteColumn',
    method: 'post',
    data: data
  })
}

export function updateSiteColumn(id, data) {
  return request({
    url: '/api/siteColumn/' + id,
    method: 'put',
    data: data
  })
}

export function deleteSiteColumn(id) {
  return request({
    url: '/api/siteColumn/' + id,
    method: 'delete'
  })
}
