<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
    <div class="fixed inset-0 bg-slate-900/60 transition-opacity" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, required: true }
})
defineEmits(['close'])
</script>