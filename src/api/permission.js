import request from '@/utils/request'

// 获取权限列表
export function getPermissonList(query) {
  return request({
    url: '/permission/list',
    method: 'get',
    params: query
  })
}

// 获取权限菜单
export function getPermissonMenu() {
  return request({
    url: '/permission/menu',
    method: 'get'
  })
}

// 添加权限
export function addPermission(data) {
  return request({
    url: '/permission/add',
    method: 'post',
    headers: { 'Content-type': 'application/json' },
    data,
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

// 更新权限
export function updatePermission(id, data) {
  return request({
    url: `/permission/update/${id}`,
    method: 'put',
    headers: { 'Content-type': 'application/json' },
    data,
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

// 删除权限
export function deletePermission(id) {
  return request({
    url: `/permission/delete/${id}`,
    method: 'delete',
    params: { id: id }
  })
}

// 修改状态
export function updateStatus(id, status) {
  return request({
    url: `/permission/update_status/${id}`,
    method: 'put',
    headers: { 'Content-type': 'application/json' },
    data: {
      id: id,
      status: status
    },
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}
