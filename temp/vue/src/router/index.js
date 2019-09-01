import Vue from 'vue'
import Router from 'vue-router'
import fileUpload from '@/components/home/list'
import fileUploadEdit from '@/components/home/edit'
import picUploadEdit from '@/components/pic/edit'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '首页',
      component: fileUpload
    },
    {
      path: '/fileUpload/edit',
      name: '编辑',
      component: fileUploadEdit
    },
    {
      path: '/picUpload/edit',
      name: '轮播图管理',
      component: picUploadEdit
    }
  ]
})
