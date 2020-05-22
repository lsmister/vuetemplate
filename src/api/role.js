import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: 'role/permissions',
    method: 'get'
  })
}

export function getRoles(data) {
  return request({
    url: '/role/list',
    method: 'get',
    params: data
  })
}

export function addRole(data) {
  return request({
    url: '/role/add',
    method: 'post',
    headers: { 'Content-type': 'application/json' },
    data,
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

export function updateRole(id, data) {
  return request({
    url: `/role/update/${id}`,
    method: 'put',
    headers: { 'Content-type': 'application/json' },
    data,
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/delete/${id}`,
    method: 'delete'
  })
}
