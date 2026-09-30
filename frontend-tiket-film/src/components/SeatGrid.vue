<script setup lang="ts">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    totalRows: number;
    totalCols: number;
    bookedSeats: Array<{ row: string; number: number }>;
  }>();

  const emit = defineEmits(['update:selectedSeats']);

  const selectedSeats = ref<Array<{ row: string; number: number }>>([]);

  const rowLetters = computed(() => {
    const rows = [];
    for (let i = 0; i < props.totalRows; i++) {
      rows.push(String.fromCharCode(65 + i)); // 65 = 'A'
    }
    return rows;
  });

  const isBooked = (row: string, number: number) => {
    return props.bookedSeats.some((s) => s.row === row && s.number === number);
  };

  const isSelected = (row: string, number: number) => {
    return selectedSeats.value.some((s) => s.row === row && s.number === number);
  };

  const toggleSeat = (row: string, number: number) => {
    if (isBooked(row, number)) return;

    const index = selectedSeats.value.findIndex((s) => s.row === row && s.number === number);
    if (index > -1) {
      selectedSeats.value.splice(index, 1);
    } else {
      selectedSeats.value.push({ row, number });
    }

    emit('update:selectedSeats', selectedSeats.value);
  };
</script>

<template>
  <div class="flex flex-col items-center gap-4 my-6">
    <div class="w-full max-w-lg h-3 bg-cyan-500 rounded-t-full shadow-[0_10px_20px_rgba(6,182,212,0.5)] mb-8 flex justify-center items-center">
      <span class="text-[10px] text-cyan-200 tracking-widest uppercase -mt-6">Layar</span>
    </div>

    <div class="flex flex-col gap-2">
      <div v-for="row in rowLetters" :key="row" class="flex items-center gap-2">
        <span class="w-6 font-bold text-gray-400 text-center">{{ row }}</span>

        <div class="flex gap-2">
          <button
            v-for="num in props.totalCols"
            :key="num"
            :disabled="isBooked(row, num)"
            @click="toggleSeat(row, num)"
            :class="[
              'w-8 h-8 rounded-t-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center',
              isBooked(row, num)
                ? 'bg-red-600/30 text-red-500 border border-red-800 cursor-not-allowed'
                : isSelected(row, num)
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            ]"
          >
            {{ num }}
          </button>
        </div>
      </div>
    </div>

    <!-- Legenda Warna -->
    <div class="flex gap-6 mt-6 text-sm text-slate-300">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-slate-700 rounded"></div> Tersedia
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-emerald-500 rounded"></div> Dipilih
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-red-600/40 border border-red-800 rounded"></div> Terisi
      </div>
    </div>
  </div>
</template>