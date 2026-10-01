<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
  durationMin?: number;
}

const router = useRouter();

const movies = ref<Movie[]>([]);
const searchQuery = ref('');
const isLoading = ref(true);
const errorMessage = ref('');

const fetchMovies = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await api.get('/movies');
    movies.value = response.data.data || response.data;
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal memuat daftar film.';
  } finally {
    isLoading.value = false;
  }
};

// Filter film berdasarkan kata kunci pencarian
const filteredMovies = computed(() => {
  if (!searchQuery.value.trim()) return movies.value;
  return movies.value.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const goToDetail = (movieId: string) => {
  router.push(`/movie/${movieId}`);
};

onMounted(() => {
  fetchMovies();
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-100">Film Sedang Tayang</h1>
        <p class="text-slate-400 mt-1 text-sm">Temukan film favoritmu dan pesan tiket sekarang</p>
      </div>

      <div class="relative w-full md:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul film..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
        <svg
          class="w-5 h-5 text-slate-400 absolute left-3 top-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div
      v-else-if="errorMessage"
      class="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center"
    >
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredMovies.length === 0" class="text-center py-16 text-slate-400">
      <p class="text-lg">Tidak ada film yang ditemukan.</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div
        v-for="movie in filteredMovies"
        :key="movie.id"
        @click="goToDetail(movie.id)"
        class="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl overflow-hidden cursor-pointer transition transform hover:-translate-y-1 shadow-lg"
      >
        <div class="relative aspect-[2/3] bg-slate-800 overflow-hidden">
          <img
            :src="movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'"
            :alt="movie.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div class="p-4 space-y-2">
          <h3 class="font-bold text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
            {{ movie.title }}
          </h3>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span v-if="movie.durationMin">
              {{ movie.durationMin }} mnt
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>