import request from '@/utils/request'

//登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    headers: { 'Content-type': 'application/json' },
    data,
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

//用户列表
export function getList() {
  return request({
    url: '/user/list',
    method: 'get'
  })
}

//角色列表
export function getRoleList() {
  return request({
    url: '/user/rolelist',
    method: 'get'
  })
}

//用户基本信息
export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

//用户重要信息
export function getImpInfo() {
  return request({
    url: '/user/impinfo',
    method: 'get'
  })
}

//用户角色
export function getUserRole() {
  return request({
    url: '/user/getUserRole',
    method: 'get'
  })
}

//更新谷歌状态
export function updateGoogleStatus(status) {
  return request({
    url: '/user/updateGoogleStatus',
    method: 'put',
    headers: { 'Content-type': 'application/json' },
    data: {
      status: status
    },
    transformRequest: [function(data) {
      return JSON.stringify(data)
    }]
  })
}

// 修改状态
export function updateStatus(id, status) {
  return request({
    url: `/user/update_status/${id}`,
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

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
