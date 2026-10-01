<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

interface Studio {
  id: string;
  name: string;
  capacity: number;
  totalRows: number;
  totalCols: number;
}

interface Showtime {
  id: string;
  movieId: string;
  studioId: string;
  price: number;
  startTime: string;
  endTime: string;
  studio?: Studio;
}

interface MovieDetail {
  id: string;
  title: string;
  description: string;
  posterUrl?: string;
  durationMin?: number;
  showtimes?: Showtime[];
}

const route = useRoute();
const router = useRouter();

const movie = ref<MovieDetail | null>(null);
const showtimes = ref<Showtime[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

const fetchMovieDetail = async () => {
  const movieId = route.params.id;
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const response = await api.get(`/movies/${movieId}`);
    // Mendukung response langsung objek maupun terbungkus { data: { ... } }
    const data = response.data.data || response.data;
    
    movie.value = data;
    showtimes.value = data.showtimes || [];
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal memuat detail film.';
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTimeRange = (startIso: string, endIso: string) => {
  if (!startIso) return '-';
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;

  const startTimeStr = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  if (end) {
    const endTimeStr = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${startTimeStr} - ${endTimeStr}`;
  }
  
  return startTimeStr;
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const selectShowtime = (showtimeId: string) => {
  router.push(`/showtime/${showtimeId}/seats`);
};

onMounted(() => {
  fetchMovieDetail();
});
</script>

<template>
  <div>
    <!-- State: Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-32">
      <div class="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- State: Error -->
    <div
      v-else-if="errorMessage || !movie"
      class="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center my-8"
    >
      {{ errorMessage || 'Film tidak ditemukan.' }}
    </div>

    <div v-else class="space-y-10">
      <div class="flex flex-col md:flex-row gap-8 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div class="w-full md:w-64 flex-shrink-0">
          <img
            :src="movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'"
            :alt="movie.title"
            class="w-full h-auto rounded-xl shadow-md border border-slate-800 object-cover"
          />
        </div>

        <div class="flex-1 space-y-4">
          <div class="flex items-center gap-3 flex-wrap">
            <span v-if="movie.durationMin" class="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              ⏱️ {{ movie.durationMin }} Menit
            </span>
          </div>

          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-100">
            {{ movie.title }}
          </h1>

          <p class="text-slate-300 text-sm md:text-base leading-relaxed">
            {{ movie.description || 'Belum ada deskripsi untuk film ini.' }}
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3">
          Jadwal Tayang Tersedia
        </h2>

        <div v-if="showtimes.length === 0" class="p-8 bg-slate-900/50 border border-slate-800/80 rounded-xl text-center text-slate-400">
          Belum ada jadwal tayang untuk film ini.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="st in showtimes"
            :key="st.id"
            class="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-5 rounded-xl flex items-center justify-between transition group shadow-lg"
          >
            <div class="space-y-1">
              <span class="inline-block text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded">
                {{ st.studio?.name || 'Studio' }}
              </span>

              <p class="text-xl font-black text-slate-100">
                {{ formatTimeRange(st.startTime, st.endTime) }}
              </p>

              <div class="text-xs text-slate-400 space-y-0.5">
                <p>{{ formatDate(st.startTime) }}</p>
                <p class="text-slate-300 font-medium">{{ formatCurrency(st.price) }} / tiket</p>
              </div>
            </div>

            <button
              @click="selectShowtime(st.id)"
              class="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition shadow-md shadow-cyan-500/20"
            >
              Pilih Kursi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>