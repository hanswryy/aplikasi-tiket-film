<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password tidak cocok.';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    await authStore.login({
      email: email.value,
      password: password.value,
    });

    router.push('/');
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Registrasi gagal.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-120px)] my-6">
    <div class="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-100">Buat Akun Baru</h2>
        <p class="text-slate-400 text-sm mt-2">Daftar untuk mulai memesan tiket bioskop favoritmu</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="John Doe"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="nama@email.com"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Konfirmasi Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-400">
        Sudah punya akun?
        <router-link to="/login" class="text-cyan-400 hover:underline font-medium">
          Masuk di sini
        </router-link>
      </div>
    </div>
  </div>
</template>