import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/home/Index.vue'
import Home from '../views/gmo/iframe/Index.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/skins',
    component: () =>
      import(/* webpackChunkName: "skin" */ '../views/skin/Index.vue'),
    children: [
      {
        path: '/skin',
        name: 'Skin',
        component: () => import(/* webpackChunkName: "skin-list" */ '../views/skin/components/list.vue')
      },
      {
        path: '/skin1',
        name: 'Skin1',
        component: () => import(/* webpackChunkName: "skin1" */ '../views/skin/components/skin1.vue')
      },
      {
        path: '/skin2',
        name: 'Skin2',
        component: () => import(/* webpackChunkName: "skin2" */ '../views/skin/components/skin2.vue')
      },
      {
        path: '/skin3',
        name: 'Skin3',
        component: () => import(/* webpackChunkName: "skin3" */ '../views/skin/components/skin3.vue')
      },
      {
        path: '/skin4',
        name: 'Skin4',
        component: () => import(/* webpackChunkName: "skin4" */ '../views/skin/components/skin4.vue')
      },
      {
        path: '/skin5',
        name: 'Skin5',
        component: () => import(/* webpackChunkName: "skin5" */ '../views/skin/components/skin5.vue')
      },
      {
        path: '/skin6',
        name: 'Skin6',
        component: () => import(/* webpackChunkName: "skin6" */ '../views/skin/components/skin6.vue')
      },
      {
        path: '/skin7',
        name: 'Skin7',
        component: () => import(/* webpackChunkName: "skin7" */ '../views/skin/components/skin7.vue')
      },
      {
        path: '/skin8',
        name: 'Skin8',
        component: () => import(/* webpackChunkName: "skin8" */ '../views/skin/components/skin8.vue')
      }
    ]
  },
  {
    path: '/steps',
    component: () =>
      import(/* webpackChunkName: "steps" */ '../views/gmo/steps/Index.vue'),
    children: [
      // {
      //   path: '/product',
      //   name: 'Product',
      //   component: () =>
      //     import(/* webpackChunkName: "product" */ '../views/product/Index.vue')
      // },
      {
        path: '/umb',
        name: 'Product',
        component: () =>
          import(/* webpackChunkName: "product" */ '../views/product/Index.vue')
      },
      {
        path: '/scarf',
        name: 'Product',
        component: () =>
          import(/* webpackChunkName: "product" */ '../views/product/Index.vue')
      },
      {
        path: '/cap',
        name: 'Product',
        component: () =>
          import(/* webpackChunkName: "product" */ '../views/product/Index.vue')
      },
      {
        path: '/design',
        name: 'Design',
        component: () =>
          import(/* webpackChunkName: "design" */ '../views/design/Index.vue')
      },
      {
        path: '/view3d',
        name: 'View3d',
        component: () =>
          import(/* webpackChunkName: "view3d" */ '../views/view3d/Index.vue')
      },
      {
        path: '/shopcart',
        name: 'ShopCart',
        component: () =>
          import(
            /* webpackChunkName: "shopcart" */ '../views/shopcart/Index.vue'
          )
      },
      {
        path: '/help',
        name: 'Help',
        component: () =>
          import(/* webpackChunkName: "help" */ '../views/gmo/help/Index.vue')
      }
    ]
  },
  {
    path: '/share',
    name: 'Share',
    component: () =>
      import(/* webpackChunkName: "share" */ '../views/share3d/Index.vue')
  },
  {
    path: '/share3d',
    name: 'Share3d',
    component: () =>
      import(/* webpackChunkName: "share3d" */ '../views/share/Index.vue')
  },
  {
    path: '*',
    name: '404',
    component: () =>
      import(/* webpackChunkName: "404" */ '../views/error/Index.vue')
  },
  {
    path: '/webview',
    name: 'Webview',
    component: () =>
      import(/* webpackChunkName: "webview" */ '../views/webview/Index.vue')
  },
  {
    path: '/color',
    name: 'Color',
    component: () => import(/* webpackChunkName: "color" */ '@/views/color/Index.vue')
  },
  {
    path: '/ar',
    name: 'AR',
    component: () => import(/* webpackChunkName: "ar" */ '@/views/ar/Index.vue')
  },
  {
    path: '/pdf',
    name: 'PDF',
    component: () => import(/* webpackChunkName: "pdf" */ '@/views/pdf/index.vue')
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (store.state.ui.firstCome) {
    store.state.ui.firstCome = false
    // 第一次进入，如果不是分享页面，跳转到首页
    if (to.name === 'Skin') {
      next()
    } else if (to.name === 'Product') {
      if (to.path === '/umb') {
        store.state.ui.homeIndex = 0
      } else if (to.path === '/scarf') {
        store.state.ui.homeIndex = 1
      } else if (to.path === '/cap') {
        store.state.ui.homeIndex = 2
      }
      next()
    } else if (to.name === 'Help') {
      next()
    } else if ((to.name === 'Share' || to.name === 'Share3d') && to.query.id) {
      next()
    } else {
      next('/')
    }
  } else {
    if (to.name === 'Skin') {
      next()
    } else if (to.name === 'Design' && !store.state.design.shareuc.product) {
      next('/')
    } else {
      next()
    }
  }
})

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
