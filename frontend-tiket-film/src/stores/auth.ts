import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  async function login(credential: { email: string; password: string }) {
    const { data } = await api.post('/auth/login', credential);
    token.value = data.accesstoken;
    localStorage.setItem('token', data.accesstoken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  async function register(payload: { name: string; email: string; password: string }) {
    await api.post('/auth/register', payload);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isAuthenticated, login, register, logout };
});