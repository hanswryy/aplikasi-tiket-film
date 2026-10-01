<script setup lang="ts">
interface Movie {
  title: string;
  posterUrl?: string;
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
  status: string;
  totalAmount: number;
  showtime?: Showtime;
  seats?: BookedSeat[];
  bookedSeats?: BookedSeat[];
}

const props = defineProps<{
  booking: Booking;
}>();

const emit = defineEmits<{
  pay: [bookingId: string];
}>();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateStr = (isoString?: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTimeStr = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'Lunas';
    case 'PENDING':
      return 'Menunggu Pembayaran';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'status-paid';
    case 'PENDING':
      return 'status-pending';
    case 'CANCELLED':
      return 'status-cancelled';
    default:
      return '';
  }
};

const seats = () => props.booking.seats?.length
  ? props.booking.seats
  : props.booking.bookedSeats;
</script>

<template>
  <article class="booking-card">
    <div class="card-header">
      <span class="booking-id">ID: {{ booking.id }}</span>
      <span :class="['status-badge', getStatusClass(booking.status)]">
        {{ getStatusLabel(booking.status) }}
      </span>
    </div>

    <div class="card-body">
      <div class="movie-poster-placeholder">
        <img
          v-if="booking.showtime?.movie?.posterUrl"
          :src="booking.showtime.movie.posterUrl"
          :alt="booking.showtime.movie.title"
        />
        <span v-else class="poster-icon">🎬</span>
      </div>

      <div class="booking-info">
        <h3 class="movie-title">
          {{ booking.showtime?.movie?.title || 'Film Tidak Diketahui' }}
        </h3>
        <p class="cinema-detail">🏛️ {{ booking.showtime?.studio?.name || 'Studio' }}</p>
        <p class="showtime-detail">
          📅 {{ formatDateStr(booking.showtime?.startTime) }} |
          ⏰ {{ formatTimeStr(booking.showtime?.startTime) }} WIB
        </p>
        <p class="seats-detail">
          💺 Kursi:
          <strong v-if="seats()?.length">
            {{ seats()?.map((seat) => `${seat.row}${seat.number}`).join(', ') }}
          </strong>
          <span v-else class="text-muted">-</span>
        </p>
      </div>
    </div>

    <div class="card-footer">
      <div class="price-section">
        <span class="price-label">Total Harga</span>
        <span class="price-value">{{ formatCurrency(booking.totalAmount || 0) }}</span>
      </div>

      <div class="action-section">
        <button
          v-if="booking.status.toUpperCase() === 'PENDING'"
          class="pay-btn"
          @click="emit('pay', booking.id)"
        >
          Bayar Sekarang
        </button>
        <span v-else-if="booking.status.toUpperCase() === 'PAID'" class="paid-check">
          ✓ Tiket Aktif
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.booking-card {
  background-color: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.booking-card:hover {
  border-color: #334155;
  transform: translateY(-2px);
}

.card-header,
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e293b;
}

.booking-id {
  font-size: 12px;
  font-family: monospace;
  color: #64748b;
}

.status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-paid {
  background-color: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.card-body {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.movie-poster-placeholder {
  width: 70px;
  height: 95px;
  background-color: #1e293b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.movie-poster-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-icon {
  font-size: 28px;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.movie-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
}

.cinema-detail,
.showtime-detail,
.seats-detail {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.seats-detail strong {
  color: #38bdf8;
}

.card-footer {
  padding-top: 14px;
  border-top: 1px dashed #1e293b;
}

.price-section {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 11px;
  color: #64748b;
}

.price-value {
  font-size: 16px;
  font-weight: 800;
  color: #38bdf8;
}

.pay-btn {
  padding: 8px 16px;
  background-color: #f59e0b;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.pay-btn:hover {
  opacity: 0.9;
}

.paid-check {
  font-size: 13px;
  color: #34d399;
  font-weight: 600;
}

.text-muted {
  color: #64748b;
}
</style>