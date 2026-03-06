<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Government Credential Issuer Portal
        </h2>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Issuance Failed</h3>
            <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
          </div>
        </div>
      </div>

      <BaseForm 
        :isLoading="isLoading" 
        submitText="Issue Credential" 
        @submit="handleIssue"
      >
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Credential Type</label>
          <select v-model="form.credentialType" required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50">
            <option value="" disabled>Select credential type</option>
            <option value="PatientIdentityCredential">Patient Identity</option>
            <option value="HealthcareProfessionalCredential">Healthcare Professional (Doctor)</option>
            <option value="AuthorizedDispenserCredential">Authorized Dispenser (Pharmacy)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Subject DID</label>
          <input v-model="form.subjectDid" type="text" placeholder="did:key:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input v-model="form.name" type="text" placeholder="Ex: John Doe" required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
        </div>
      </BaseForm>

      <Modal :isOpen="!!offerUrl" @close="resetFormAndModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-4">
            <svg class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-slate-900">Credential Offer</h3>
          <p class="text-xs text-slate-500 mt-1">Predicted ID: {{ generatedVcId }}</p>
          
          <div class="mt-6 flex justify-center">
            <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code credential" class="border border-slate-200 rounded-lg p-2 bg-white shadow-sm" />
            <div v-else class="animate-pulse bg-slate-200 w-[200px] h-[200px] rounded-lg"></div>
          </div>
          
          <div class="bg-slate-50 p-3 mt-4 border border-slate-200 rounded break-all text-xs text-slate-700 font-mono select-all text-left max-h-32 overflow-y-auto">
            {{ offerUrl }}
          </div>
          
          <div class="mt-6">
            <a :href="offerUrl" target="_blank" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:text-sm">
              Open Web Wallet
            </a>
            <button @click="resetFormAndModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:text-sm">
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const { isLoading, offerUrl, generatedVcId, errorMessage, issue, reset } = useCredentialIssuer()
const qrCodeDataUrl = ref('')

const form = ref({
  credentialType: '',
  subjectDid: '',
  name: ''
})

watch(offerUrl, async (newUrl) => {
  if (newUrl) {
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(newUrl, { 
        width: 200, 
        margin: 2,
        color: {
          dark: '#0f172a', 
          light: '#ffffff'
        }
      })
    } catch (err) {
      console.error('error generating qrcode locally:', err)
      errorMessage.value = 'Fail to generate QR code. Please try again.'
    }
  } else {
    qrCodeDataUrl.value = ''
  }
})

const handleIssue = async () => {
  await issue({ ...form.value })
}

const resetFormAndModal = () => {
  reset() 
  form.value.credentialType = ''
  form.value.subjectDid = ''
  form.value.name = ''
}
</script>