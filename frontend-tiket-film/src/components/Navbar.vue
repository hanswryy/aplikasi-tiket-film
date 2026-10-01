<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '../stores/auth';
  import { useRouter } from 'vue-router';

  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);
  const router = useRouter();

  const handleLogout = () => {
    authStore.logout();
    router.push('/login');
  };
</script>

<template>
  <nav class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center text-slate-100">
    <router-link to="/" class="text-xl font-bold tracking-wider text-cyan-400">
      CINETIX
    </router-link>

    <div class="flex items-center gap-6">
      <router-link to="/" class="hover:text-cyan-400 transition">Katalog Film</router-link>
      
      <template v-if="authStore.isAuthenticated">
        <router-link to="/my-bookings" class="hover:text-cyan-400 transition">Tiket Saya</router-link>
        <button 
          @click="handleLogout" 
          class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </template>

      <template v-else>
        <router-link to="/login" class="hover:text-cyan-400 transition">Login</router-link>
        <router-link 
          to="/register" 
          class="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          Register
        </router-link>
      </template>
    </div>
  </nav>
</template>