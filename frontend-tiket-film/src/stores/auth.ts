import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref<any | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    token.value = data.access_token;
    localStorage.setItem('token', data.access_token);
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