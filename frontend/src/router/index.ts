import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Setting from '../views/Setting.vue'
import Chat from '../views/Welcome.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:key?',
    name: 'Setting',
    component: Setting,
  }, {
    path: '/chat',
    name: 'Chat',
    component: Chat,
  }
];



const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
