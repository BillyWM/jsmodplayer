/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'
import OldDemo from '@/components/OldDemo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'OldDemo',
      component: OldDemo
    }
  ]
})
