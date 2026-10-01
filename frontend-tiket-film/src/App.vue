<script setup lang="ts">
  import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <Navbar />
    <main class="flex-1 max-w-7xl w-full mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>