import request from '@/utils/request'

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

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function getImpInfo() {
  return request({
    url: '/user/impinfo',
    method: 'get'
  })
}

export function getUserRole() {
  return request({
    url: '/user/getUserRole',
    method: 'get'
  })
}

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

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
