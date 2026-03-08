<template>
  <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
    <div class="flex justify-between items-center mb-6 px-2">
      <span class="text-sm text-slate-600 font-medium">
        {{ actorRole }}: <span class="text-teal-700 truncate block max-w-[200px]">{{ actorDid }}</span>
      </span>
      <button @click="$emit('cancel')" class="text-xs text-red-600 hover:underline">Cancel & Logout</button>
    </div>

    <h3 class="text-lg font-medium text-slate-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-slate-500 mb-6">{{ description }}</p>

    <div v-if="error" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-left">
      <h3 class="text-sm font-medium text-red-800">Verification Error</h3>
      <div class="mt-2 text-sm text-red-700">{{ error }}</div>
    </div>

    <div class="mt-6 flex justify-center">
      <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="Verification QR Code" class="border border-slate-200 rounded-lg p-2 bg-white shadow-sm" />
      <div v-else class="animate-pulse bg-slate-200 w-[200px] h-[200px] rounded-lg flex items-center justify-center text-slate-500 text-sm">
        Generating Request...
      </div>
    </div>
    
    <div v-if="verificationUrl" class="bg-slate-50 p-3 mt-4 border border-slate-200 rounded break-all text-xs text-slate-700 font-mono select-all text-left max-h-32 overflow-y-auto">
      {{ verificationUrl }}
    </div>
    
    <p v-if="qrCodeUrl" class="text-xs text-slate-400 mt-4 animate-pulse">Waiting for wallet presentation...</p>
  </div>
</template>

<script setup>
defineProps({
  actorRole: { type: String, required: true },
  actorDid: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  qrCodeUrl: { type: String, default: '' },
  verificationUrl: { type: String, default: '' },
  error: { type: String, default: '' }
})
defineEmits(['cancel'])
</script>