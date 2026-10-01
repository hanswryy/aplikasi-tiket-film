<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Silakan isi email dan password.';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    await authStore.login({
      email: email.value,
      password: password.value,
    });

    router.push('/');
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-120px)]">
    <div class="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-100">Selamat Datang</h2>
        <p class="text-slate-400 text-sm mt-2">Masuk ke akun Anda untuk memesan tiket bioskop</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="nama@email.com"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isLoading ? 'Memproses...' : 'Masuk Akun' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-400">
        Belum punya akun?
        <router-link to="/register" class="text-cyan-400 hover:underline font-medium">
          Daftar sekarang
        </router-link>
      </div>
    </div>
  </div>
</template>