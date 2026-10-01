<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '../stores/booking';
import api from '../services/api';

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  durationMin: number;
}

interface Studio {
  id: string;
  name: string;
  capacity: number;
  totalRows: number;
  totalCols: number;
}

interface BookedSeat {
  id: string;
  showtimeId: string;
  bookingId: string;
  row: string;
  number: number;
}

interface ShowtimeDetail {
  id: string;
  movieId: string;
  studioId: string;
  price: number;
  startTime: string;
  endTime: string;
  movie: Movie;
  studio: Studio;
  bookedSeats: BookedSeat[];
}

interface SeatItem {
  id: string;      // Contoh: "A-1"
  row: string;     // Contoh: "A"
  number: number;  // Contoh: 1
  status: 'available' | 'occupied';
}

interface SeatRow {
  label: string;
  seats: SeatItem[];
}

interface SelectedSeat {
  id: string;
  row: string;
  number: number;
}

const route = useRoute();
const router = useRouter();

const showtime = ref<ShowtimeDetail | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
const maxSeats = 6;

const selectedSeats = ref<SelectedSeat[]>([]);

// Fetch Data dari Backend berdasarkan ID Showtime di URL
const fetchShowtime = async () => {
  const showtimeId = route.params.id;
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const response = await api.get(`/showtimes/${showtimeId}`);
    const data = response.data.data || response.data;
    showtime.value = data;
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal memuat jadwal tayang.';
  } finally {
    isLoading.value = false;
  }
};

// Generasi Grid Kursi Dinamis berdasarkan studio.totalRows & studio.totalCols
const rows = computed<SeatRow[]>(() => {
  if (!showtime.value || !showtime.value.studio) return [];

  const { totalRows, totalCols } = showtime.value.studio;
  
  // Buat Set dari bookedSeats untuk matching cepat (A-1, B-2, dst)
  const bookedSet = new Set(
    (showtime.value.bookedSeats || []).map((s) => `${s.row}-${s.number}`)
  );

  const result: SeatRow[] = [];

  for (let r = 0; r < totalRows; r++) {
    // Generasi Label Baris: 0 -> 'A', 1 -> 'B', 2 -> 'C', dst.
    const rowLabel = String.fromCharCode(65 + r);
    const seats: SeatItem[] = [];

    for (let c = 1; c <= totalCols; c++) {
      const seatKey = `${rowLabel}-${c}`;
      seats.push({
        id: seatKey,
        row: rowLabel,
        number: c,
        status: bookedSet.has(seatKey) ? 'occupied' : 'available',
      });
    }

    result.push({
      label: rowLabel,
      seats,
    });
  }

  return result;
});

// Cek apakah kursi terpilih
const isSelected = (seatId: string) => {
  return selectedSeats.value.some((s) => s.id === seatId);
};

// Toggle seleksi kursi
const toggleSeat = (seat: SeatItem) => {
  if (seat.status === 'occupied') return;

  const index = selectedSeats.value.findIndex((s) => s.id === seat.id);

  if (index > -1) {
    selectedSeats.value.splice(index, 1);
  } else {
    if (selectedSeats.value.length >= maxSeats) {
      alert(`Maksimal pemilihan adalah ${maxSeats} kursi per transaksi.`);
      return;
    }
    selectedSeats.value.push({
      id: seat.id,
      row: seat.row,
      number: seat.number,
    });
  }
};

// Total Harga Dinamis
const totalPrice = computed(() => {
  if (!showtime.value) return 0;
  return selectedSeats.value.length * showtime.value.price;
});

// Formatters
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTimeStr = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDateStr = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getSeatTooltip = (seat: SeatItem) => {
  if (seat.status === 'occupied') return `Kursi ${seat.row}${seat.number} (Terisi)`;
  return `Kursi ${seat.row}${seat.number} (${formatCurrency(showtime.value?.price || 0)})`;
};

const handleCheckout = async () => {
  if (!showtime.value || selectedSeats.value.length === 0) return;

  const payload = {
    showtimeId: showtime.value.id,
    seats: selectedSeats.value.map((s) => ({
      row: s.row,
      number: s.number,
    })),
  };

  try {
    const bookingResult = await useBookingStore().createBooking(payload);

    // Ambil ID booking baik dari bookingResult.id, bookingResult.bookingId, atau bookingResult.data.id
    const createdBookingId =
      bookingResult?.id || bookingResult?.bookingId || bookingResult?.data?.id;

    if (createdBookingId) {
      router.push({
        name: 'payment',
        params: { bookingId: createdBookingId },
      });
    } else {
      alert('Gagal mendapatkan ID pemesanan. Silakan coba lagi.');
    }
  } catch (error) {
    console.error('Checkout Error:', error);
    alert('Terjadi kesalahan saat memproses pemesanan.');
  }
};

onMounted(() => {
  fetchShowtime();
});
</script>

<template>
  <div class="seat-picker-container">
    <!-- State Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat peta kursi...</p>
    </div>

    <!-- State Error -->
    <div v-else-if="errorMessage || !showtime" class="error-state">
      {{ errorMessage || 'Jadwal tayang tidak ditemukan.' }}
    </div>

    <template v-else>
      <!-- Header Informasi Film & Studio -->
      <header class="header">
        <h1 class="movie-title">{{ showtime.movie.title }}</h1>
        <p class="cinema-info">
          {{ showtime.studio.name }} | {{ formatDateStr(showtime.startTime) }}, {{ formatTimeStr(showtime.startTime) }} WIB
        </p>
      </header>

      <!-- Visualisasi Layar Bioskop -->
      <div class="screen-container">
        <div class="screen"></div>
        <p class="screen-label">LAYAR BIOSKOP</p>
      </div>

      <!-- Grid Kursi Dinamis -->
      <div class="cinema-grid">
        <div v-for="row in rows" :key="row.label" class="seat-row">
          <span class="row-label">{{ row.label }}</span>

          <div class="seats-group">
            <button
              v-for="seat in row.seats"
              :key="seat.id"
              :class="[
                'seat',
                { selected: isSelected(seat.id) },
                { occupied: seat.status === 'occupied' }
              ]"
              :disabled="seat.status === 'occupied'"
              :title="getSeatTooltip(seat)"
              @click="toggleSeat(seat)"
            >
              <span class="seat-number">{{ seat.number }}</span>
            </button>
          </div>

          <span class="row-label">{{ row.label }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <span class="seat legend-available"></span>
          <span>Tersedia ({{ formatCurrency(showtime.price) }})</span>
        </div>
        <div class="legend-item">
          <span class="seat selected"></span>
          <span>Dipilih</span>
        </div>
        <div class="legend-item">
          <span class="seat occupied"></span>
          <span>Terisi</span>
        </div>
      </div>

      <!-- Ringkasan & Pembayaran -->
      <footer class="booking-summary">
        <div class="summary-details">
          <div class="selected-seats-info">
            <span class="label">Kursi Terpilih (Maksimal {{ maxSeats }}):</span>
            <div class="seats-tags">
              <span v-if="selectedSeats.length === 0" class="placeholder">Belum ada kursi dipilih</span>
              <span
                v-for="seat in selectedSeats"
                :key="seat.id"
                class="seat-tag"
              >
                {{ seat.row }}{{ seat.number }}
              </span>
            </div>
          </div>
          <div class="total-price-info">
            <span class="label">Total Pembayaran:</span>
            <span class="price-value">{{ formatCurrency(totalPrice) }}</span>
          </div>
        </div>

        <button
          class="checkout-btn"
          :disabled="selectedSeats.length === 0"
          @click="handleCheckout"
        >
          Lanjutkan Pembayaran ({{ selectedSeats.length }} Kursi)
        </button>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.seat-picker-container {
  max-width: 850px;
  margin: 20px auto;
  padding: 28px;
  background-color: #0f172a;
  color: #f8fafc;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
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

.error-state {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 32px;
}
.movie-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}
.cinema-info {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* Screen */
.screen-container {
  text-align: center;
  margin-bottom: 40px;
}
.screen {
  height: 12px;
  width: 85%;
  margin: 0 auto 12px;
  background: linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.05) 100%);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.35);
}
.screen-label {
  font-size: 11px;
  letter-spacing: 5px;
  color: #64748b;
  margin: 0;
  font-weight: 700;
}

/* Grid Layout */
.cinema-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
  align-items: center;
  overflow-x: auto;
  padding: 10px 0;
}
.seat-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.row-label {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  width: 20px;
  text-align: center;
}
.seats-group {
  display: flex;
  gap: 8px;
}

/* Seat Base */
.seat {
  width: 34px;
  height: 34px;
  border-radius: 8px 8px 4px 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
  background-color: #334155;
  color: #cbd5e1;
}

.seat:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: #475569;
}

.seat.selected {
  background-color: #10b981 !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
  transform: scale(1.05);
}

.seat.occupied {
  background-color: #b91c1c;
  color: #fca5a5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Legend */
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  padding: 14px;
  background: #1e293b;
  border-radius: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}
.legend-item .seat {
  width: 20px;
  height: 20px;
  pointer-events: none;
  border-radius: 4px;
}
.legend-available {
  background-color: #334155;
}

/* Summary & Checkout */
.booking-summary {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-top: 1px solid #334155;
  padding-top: 24px;
}
.summary-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.selected-seats-info, .total-price-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-size: 12px;
  color: #94a3b8;
}
.placeholder {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}
.seats-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.seat-tag {
  background-color: #10b981;
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.price-value {
  font-size: 22px;
  font-weight: 800;
  color: #38bdf8;
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.checkout-btn:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}
.checkout-btn:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .seat-picker-container {
    padding: 18px;
  }
  .seat {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
  .summary-details {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>