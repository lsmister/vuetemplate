import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // get user info
          const { roles } = await store.dispatch('user/getInfo')

          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // console.log(router.options.routes)
          router.addRoutes(accessRoutes)
          router.options.routes = router.options.routes.concat(accessRoutes)

          //const routes = await store.dispatch('user/getUserRole') //通过用户角色获取路由
          // console.log(dataArrayToRoutes(routes))
          // const asyncRoutes = dataArrayToRoutes(routes)
          // router.addRoutes(asyncRoutes)
          // const c = router.options.routes.concat(asyncRoutes)
          // console.log(router.options.routes);
          // console.log(asyncRoutes);
          // router.options.routes=c;
          // console.log(router.options.routes);

          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          // await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          // next(`/login?redirect=${to.path}`)
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

//根据后台权限生成路由 - 但指令权限和icon未完成
/*function dataArrayToRoutes(data) {
  const res = []
  data.forEach(item => {
    const tmp = { ...item }
    if (tmp.component === 'Layout') {
      tmp.component = Layout
    } else {
      let sub_view = tmp.component
      sub_view = sub_view.replace(/^\/!*!/g, '')
      tmp.path = '/'+tmp.path
      tmp.component = () => import(`@/views/${sub_view}`)  //这里很重要，把view动态加载进来，而且似乎我只找到这样的写法，用拼接不行，然后 views 后面没有斜杆也不行
    }
    if (tmp.children) {
      tmp.meta = {title:tmp.name, icon:'user'}
      tmp.children = dataArrayToRoutes(tmp.children)
    }
    res.push(tmp)
  })
  return res
}*/
