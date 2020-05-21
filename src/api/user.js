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

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + token }
  })
}

export function logout(token) {
  return request({
    url: '/user/logout',
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + token }
  })
}
