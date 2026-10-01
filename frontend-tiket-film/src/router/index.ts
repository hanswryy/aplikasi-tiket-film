import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import MovieDetailView from '../views/MovieDetailView.vue';
import SeatPickerView from '../views/SeatPickerView.vue';
import MyBookingsView from '../views/MyBookingsView.vue';
import PaymentView from '../views/PaymentView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/movie/:id', name: 'movie-detail', component: MovieDetailView },
  { 
    path: '/showtime/:id/seats', 
    name: 'seat-picker', 
    component: SeatPickerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/:bookingId',
    name: 'payment',
    component: PaymentView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/my-bookings', 
    name: 'my-bookings', 
    component: MyBookingsView,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;