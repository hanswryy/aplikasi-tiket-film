<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

interface BookingDetail {
  id: string;
  showtimeId: string;
  totalPrice?: number;
  status?: string;
  showtime?: {
    movie?: {
      title: string;
    };
    studio?: {
      name: string;
    };
    startTime?: string;
  };
  bookedSeats?: Array<{
    row: string;
    number: number;
  }>;
}

const route = useRoute();
const router = useRouter();

const bookingId = route.params.bookingId as string;

const booking = ref<BookingDetail | null>(null);
const isLoading = ref(true);
const isPaying = ref(false);
const errorMessage = ref('');

const fetchBookingDetail = async () => {
  if (!bookingId) {
    errorMessage.value = 'ID Booking tidak ditemukan.';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const response = await api.get(`/bookings/${bookingId}`);
    booking.value = response.data.data || response.data;
  } catch (err: any) {
    console.warn('Gagal memuat detail booking, melanjutkan dengan ID saja:', err);
  } finally {
    isLoading.value = false;
  }
};

const handlePay = async () => {
  if (!bookingId) return;

  try {
    isPaying.value = true;
    errorMessage.value = '';

    const response = await api.post(`/bookings/${bookingId}/pay`);
    const data = response.data.data || response.data;

    alert('Pembayaran berhasil!');

    router.push('/my-bookings');
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Gagal memproses pembayaran. Silakan coba lagi.';
  } finally {
    isPaying.value = false;
  }
};

const formatCurrency = (amount?: number) => {
  if (amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

onMounted(() => {
  fetchBookingDetail();
});
</script>

<template>
  <div class="payment-container">
    <div class="payment-card">
      <header class="header">
        <h2>Pembayaran Tiket</h2>
        <p class="booking-id-text">Kode Pemesanan: <span>{{ bookingId }}</span></p>
      </header>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat rincian pembayaran...</p>
      </div>

      <template v-else>
        <div v-if="booking" class="order-summary">
          <div class="summary-row" v-if="booking.showtime?.movie?.title">
            <span class="label">Film</span>
            <span class="value">{{ booking.showtime.movie.title }}</span>
          </div>

          <div class="summary-row" v-if="booking.showtime?.studio?.name">
            <span class="label">Studio</span>
            <span class="value">{{ booking.showtime.studio.name }}</span>
          </div>

          <div class="summary-row" v-if="booking.bookedSeats && booking.bookedSeats.length">
            <span class="label">Kursi</span>
            <span class="value">
              {{ booking.bookedSeats.map((s) => `${s.row}${s.number}`).join(', ') }}
            </span>
          </div>

          <div class="summary-row total-row" v-if="booking.totalPrice">
            <span class="label">Total Pembayaran</span>
            <span class="value price">{{ formatCurrency(booking.totalPrice) }}</span>
          </div>
        </div>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <div class="payment-methods">
          <p class="section-label">Pilih Metode Pembayaran</p>
          <label class="method-option selected">
            <input type="radio" checked name="payment_method" />
            <div class="method-info">
              <span class="method-name">QRIS / Instant Payment</span>
              <span class="method-sub">Verifikasi Otomatis</span>
            </div>
          </label>
        </div>

        <div class="action-buttons">
          <button
            class="pay-button"
            :disabled="isPaying"
            @click="handlePay"
          >
            <span v-if="isPaying" class="btn-spinner"></span>
            <span>{{ isPaying ? 'Memproses Pembayaran...' : 'Bayar Sekarang' }}</span>
          </button>

          <button
            class="cancel-button"
            :disabled="isPaying"
            @click="router.back()"
          >
            Batal
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.payment-card {
  background-color: #0f172a;
  color: #f8fafc;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid #1e293b;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.booking-id-text {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.booking-id-text span {
  color: #38bdf8;
  font-weight: 600;
  font-family: monospace;
}

.loading-state {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #334155;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-summary {
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.summary-row .label {
  color: #94a3b8;
}

.summary-row .value {
  font-weight: 600;
  color: #f8fafc;
}

.total-row {
  border-top: 1px solid #334155;
  padding-top: 12px;
  margin-top: 4px;
}

.total-row .price {
  font-size: 18px;
  color: #38bdf8;
  font-weight: 800;
}

.section-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 10px;
  font-weight: 600;
}

.payment-methods {
  margin-bottom: 24px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: #1e293b;
  border: 2px solid #334155;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-option.selected {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.method-info {
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
}

.method-sub {
  font-size: 11px;
  color: #94a3b8;
}

.error-box {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pay-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.pay-button:hover:not(:disabled) {
  opacity: 0.95;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.pay-button:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
}

.cancel-button {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
  color: #f8fafc;
  background-color: #1e293b;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>