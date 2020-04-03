import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
// const Home = r => require.ensure([], () => r(require('../components/Home')), 'load');// 懒加载
// const  Home = resolve => require(['../components/Home'], resolve);// 懒加载
// import UserCenter from "@/components/UserCenter"
// import Own from "@/components/admin/Own"
// import Reply from "@/components/admin/Reply"
// import Manage from "@/components/admin/Manage"
// import Editor from "@/components/admin/Editor"
// import Doc from '@/components/Doc'
// import ChatRoom from '@/components/ChatRoom'
import DemoRoom from '@/components/DemoRoom'
import Demo from '@/components/Demo'
// import Demo1 from '@/components/Demo1'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      // component:  resolve => require(['../page/my/my.vue'], resolve),//懒加载
      component: Home
    },
    {
      path: '/usercenter',
      name: 'usercenter',
      component: resolve => require(['../components/UserCenter'], resolve),
      children:[
        {
          path:'Reply',
          name:'Reply',
          component:resolve => require(['../components/admin/Reply'], resolve)
        },
        {
          path:'Own',
          name:'Own',
          component:resolve => require(['../components/admin/Own'], resolve)
        },
        {
          path:'Manage',
          name:'Manage',
          component:resolve => require(['../components/admin/Manage'], resolve)
        },
        {
          path:'Editor',
          name:'Editor',
          component:resolve => require(['../components/admin/Editor'], resolve)
        }
      ]
    },
    {
      path: '/Doc',
      name: 'Doc',
      component: resolve => require(['../components/Doc'], resolve)
    },
    {
      path: '/ChatRoom',
      name: 'ChatRoom',
      component: resolve => require(['../components/ChatRoom'], resolve)
    },
    {
      path: '/DemoRoom',
      name: 'DemoRoom',
      component: DemoRoom
    },
    {
      path: '/Demo',
      name: 'Demo',
      component: Demo
    },
    {
      path: '/Demo1',
      name: 'Demo1',
      component: resolve => require(['../components/Demo1'], resolve)
    },
    {
      path: '/About',
      name: 'About',
      component: About
    }
  ]
})
