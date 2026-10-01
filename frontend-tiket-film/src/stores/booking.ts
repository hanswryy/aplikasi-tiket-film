import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface SeatPayload {
  row: string;
  number: number;
}

export interface CreateBookingPayload {
  showtimeId: string;
  seats: SeatPayload[];
}

export interface BookingResponse {
  id: string;
  showtimeId: string;
  userId?: string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}

export const useBookingStore = defineStore('booking', () => {
  const isSubmitting = ref(false);
  const errorMessage = ref<string | null>(null);
  const currentBooking = ref<BookingResponse | null>(null);

  const createBooking = async (payload: CreateBookingPayload): Promise<BookingResponse> => {
    isSubmitting.value = true;
    errorMessage.value = null;

    try {
      const response = await api.post('/bookings', payload);
      const data = response.data.data || response.data;
      
      currentBooking.value = data;
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal memproses pemesanan tiket.';
      errorMessage.value = message;
      throw new Error(message);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetBookingState = () => {
    errorMessage.value = null;
    currentBooking.value = null;
  };

  return {
    isSubmitting,
    errorMessage,
    currentBooking,
    createBooking,
    resetBookingState,
  };
});