import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/admin/login",
    },
    {
      path: "/admin/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/admin/dashboard",
      name: "dashboard",
      component: () => import("../views/ModeratorView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/vote",
      name: "votes",
      component: () => import("../views/VotesView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
  
  if (to.meta.requiresAuth && (!token || user?.role !== 'admin')) {
    next('/admin/login')
  } else if (to.path === '/admin/login' && token && user?.role === 'admin') {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router;
