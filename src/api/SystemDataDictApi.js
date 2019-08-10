import request from '@/utils/request'

export function listSystemDataDict(params) {
  return request({
    url: '/api/systemDataDict',
    method: 'get',
    params: params
  })
}

export function createSystemDataDict(data) {
  return request({
    url: '/api/systemDataDict',
    method: 'post',
    data: data
  })
}

export function updateSystemDataDict(id, data) {
  return request({
    url: '/api/systemDataDict/' + id,
    method: 'put',
    data: data
  })
}

export function deleteSystemDataDict(id) {
  return request({
    url: '/api/systemDataDict/' + id,
    method: 'delete'
  })
}
