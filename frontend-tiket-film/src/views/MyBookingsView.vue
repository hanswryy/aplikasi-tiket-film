<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import TicketCard from '../components/TicketCard.vue';

interface Movie {
  title: string;
  posterUrl?: string;
  durationMin?: number;
}

interface Studio {
  name: string;
}

interface Showtime {
  startTime: string;
  movie?: Movie;
  studio?: Studio;
}

interface BookedSeat {
  row: string;
  number: number;
}

interface Booking {
  id: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED' | string;
  totalAmount : number;
  createdAt: string;
  showtime?: Showtime;
  seats?: BookedSeat[];
  bookedSeats?: BookedSeat[];
}

const router = useRouter();

const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

const fetchMyBookings = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const response = await api.get('/bookings/my-bookings');
    const data = response.data.data || response.data;
    bookings.value = Array.isArray(data) ? data : [];
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Gagal memuat daftar tiket Anda.';
  } finally {
    isLoading.value = false;
  }
};

const handlePay = (bookingId: string) => {
  router.push({ name: 'payment', params: { bookingId } });
};

onMounted(() => {
  fetchMyBookings();
});
</script>

<template>
  <div class="my-bookings-container">
    <header class="page-header">
      <h1>Tiket Saya</h1>
      <p>Daftar riwayat pemesanan tiket bioskop Anda</p>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat daftar tiket...</p>
    </div>

    <div v-else-if="errorMessage" class="error-box">
      {{ errorMessage }}
      <button class="retry-btn" @click="fetchMyBookings">Coba Lagi</button>
    </div>

    <div v-else-if="bookings.length === 0" class="empty-state">
      <div class="empty-icon">🎟️</div>
      <h3>Belum Ada Tiket</h3>
      <p>Anda belum memesan tiket bioskop sama sekali.</p>
      <button class="explore-btn" @click="router.push('/')">Cari Film</button>
    </div>

    <div v-else class="bookings-list">
      <TicketCard
        v-for="booking in bookings"
        :key="booking.id"
        :booking="booking"
        @pay="handlePay"
      />
    </div>
  </div>
</template>

<style scoped>
.my-bookings-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 16px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #f8fafc;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.page-header p {
  color: #94a3b8;
  margin: 0;
  font-size: 14px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #0f172a;
  border-radius: 16px;
  border: 1px solid #1e293b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #334155;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.empty-state p {
  color: #94a3b8;
  margin: 0 0 20px 0;
  font-size: 14px;
}

.explore-btn,
.retry-btn {
  padding: 10px 20px;
  background-color: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.error-box {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

</style>