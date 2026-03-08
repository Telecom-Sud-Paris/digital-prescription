<template>
  <Modal :isOpen="isOpen" @close="$emit('close')">
    <div class="text-center">
      <div v-if="!isIssued">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-4">
          <svg class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg leading-6 font-medium text-slate-900">Credential Offer</h3>
        <p class="text-xs text-slate-500 mt-1">Scan the QR code to add the {{ credentialName }} to the wallet.</p>
        
        <div class="mt-6 flex justify-center">
          <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="border border-slate-200 rounded-lg p-2 bg-white shadow-sm" />
          <div v-else class="animate-pulse bg-slate-200 w-[200px] h-[200px] rounded-lg"></div>
        </div>
        
        <div v-if="offerUrl" class="bg-slate-50 p-3 mt-4 border border-slate-200 rounded break-all text-xs text-slate-700 font-mono select-all text-left max-h-32 overflow-y-auto">
          {{ offerUrl }}
        </div>
        
        <div class="mt-6">
          <a :href="offerUrl" target="_blank" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:text-sm">
            Open Web Wallet
          </a>
        </div>
      </div>
      
      <div v-else>
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl leading-6 font-bold text-slate-900">Success!</h3>
        <p class="text-sm text-slate-600 mt-2">The {{ credentialName }} was successfully added to the wallet and anchored on the blockchain.</p>
      </div>
      
      <div class="mt-6">
        <button @click="$emit('close')" class="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:text-sm">
          {{ isIssued ? actionButtonText : 'Cancel' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, required: true },
  isIssued: { type: Boolean, required: true },
  offerUrl: { type: String, default: '' },
  qrCodeDataUrl: { type: String, default: '' },
  credentialName: { type: String, default: 'credential' },
  actionButtonText: { type: String, default: 'Create New' }
})
defineEmits(['close'])
</script>