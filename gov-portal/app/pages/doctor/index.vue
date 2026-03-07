<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Portal</h2>
        <p class="mt-2 text-sm text-slate-600">
          Issue digital prescriptions for your patients.
        </p>
      </div>

      <div v-if="!isLoggedIn" class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Healthcare Professional Access</h3>
        <p class="text-sm text-slate-500 mb-6">Insert your DID to access the system.</p>
        <div v-if="errorMessage" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
        </div>
        <form @submit.prevent="login">
          <label class="block text-sm font-medium text-slate-700 mb-1">Your DID (Doctor)</label>
          <input v-model="doctorDid" type="text" placeholder="did:key:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50 mb-6" />
          <Button type="submit" :loading="isLoggingIn">Authenticate</Button>
        </form>
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-6 px-2">
          <span class="text-sm text-slate-600 font-medium">Doctor: <span class="text-teal-700 truncate block max-w-[200px]">{{ doctorDid }}</span></span>
          <button @click="isLoggedIn = false" class="text-xs text-red-600 hover:underline">Logout</button>
        </div>

      <div v-if="errorMessage" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
      </div>

        <BaseForm 
          :isLoading="isLoading" 
          submitText="Issue Prescription" 
          @submit="handleIssue"
        >
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Patient DID</label>
            <input v-model="form.patientDid" type="text" placeholder="did:key:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Medication (Composition/Name)</label>
            <input v-model="form.medication" type="text" placeholder="Ex: Amoxiciline 500mg" required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Refills</label>
              <input v-model="form.refills" type="number" min="0" required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Validity</label>
              <input v-model="form.expirationDate" type="date" required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
            </div>
          </div>
        </BaseForm>
      </div>

      <Modal :isOpen="!!offerUrl" @close="resetFormAndModal">
        <div class="text-center">
          
          <div v-if="!isIssued">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-4">
              <svg class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg leading-6 font-medium text-slate-900">Credential Offer</h3>
            <p class="text-xs text-slate-500 mt-1">Scan the QR code to add the prescription to your wallet.</p>
            
            <div class="mt-6 flex justify-center">
              <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="border border-slate-200 rounded-lg p-2 bg-white shadow-sm" />
              <div v-else class="animate-pulse bg-slate-200 w-[200px] h-[200px] rounded-lg"></div>
            </div>
            <div class="bg-slate-50 p-3 mt-4 border border-slate-200 rounded break-all text-xs text-slate-700 font-mono select-all text-left max-h-32 overflow-y-auto">
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
            <p class="text-sm text-slate-600 mt-2">The prescription was successfully added to the patient's wallet and recorded on the blockchain.</p>
          </div>

          <div class="mt-6">
            <button @click="resetFormAndModal" class="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:text-sm">
              {{ isIssued ? 'Create New Prescription' : 'Cancel' }}
            </button>
          </div>

        </div>
      </Modal>

    </div>
  </div>
</template>

<script setup>
import QRCode from 'qrcode'
const { isLoading, offerUrl, generatedVcId, errorMessage, issuePrescription, reset } = usePrescriptionIssuer()
const isLoggedIn = ref(false)
const doctorDid = ref('')
const isIssued = ref(false) 
const isLoggingIn = ref(false)
let pollInterval = null 

const login = async () => {
  if (doctorDid.value.trim() === '') return
  isLoggingIn.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/blockchain/trust-registry/${encodeURIComponent(doctorDid.value)}/validate`, {
      params: { role: 'doctor' }
    })
    isLoggedIn.value = true
  } catch (e) {
    errorMessage.value = e.data?.statusMessage || 'Access Denied: Invalid DID or missing Doctor credentials.'
  } finally {
    isLoggingIn.value = false
  }

}

const form = ref({
  patientDid: '',
  medication: '',
  refills: 0,
  expirationDate: ''
})

const qrCodeDataUrl = ref('')

watch(offerUrl, async (newUrl) => {
  if (newUrl) {
    qrCodeDataUrl.value = await QRCode.toDataURL(newUrl, { width: 200, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
  } else {
    qrCodeDataUrl.value = ''
  }
})

watch(generatedVcId, (newId) => {
  if (newId) {
    pollInterval = setInterval(async () => {
      try {
        await $fetch(`/api/blockchain/prescription/${newId}`)
        isIssued.value = true
        clearInterval(pollInterval)
      } catch (e) {
        }
    }, 3000)
  } else {
    clearInterval(pollInterval)
    isIssued.value = false
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const handleIssue = async () => {
  const isoExpirationDate = new Date(form.value.expirationDate).toISOString()
  await issuePrescription({ 
    ...form.value, 
    expirationDate: isoExpirationDate,
    doctorDid: doctorDid.value 
  })
}

const resetFormAndModal = () => {
  reset()
  if (pollInterval) clearInterval(pollInterval)
  isIssued.value = false
  form.value.medication = ''
  form.value.refills = 0
  form.value.expirationDate = ''
}
</script>