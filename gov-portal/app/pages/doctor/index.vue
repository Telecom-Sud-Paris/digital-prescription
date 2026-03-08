<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Portal</h2>
        <p class="mt-2 text-sm text-slate-600">Issue digital prescriptions for your patients.</p>
      </div>

      <DidLoginForm 
        v-if="!isLoggedIn"
        title="Healthcare Professional Access"
        inputLabel="Your DID (Doctor)"
        :loading="isLoggingIn"
        :error="authError"
        @submit="handleLogin" 
      />

      <SsiQrVerification 
        v-else-if="!isVerified"
        actorRole="Doctor"
        :actorDid="doctorDid"
        title="Patient Verification"
        description="Ask the patient to scan this QR Code to present their PatientCredential."
        :qrCodeUrl="verificationQrCode"
        :verificationUrl="verificationUrl"
        :error="verificationError"
        @cancel="handleLogout"
      />

      <div v-else>
        <div class="flex justify-between items-center mb-6 px-2">
          <span class="text-sm text-slate-600 font-medium">Doctor: <span class="text-teal-700 truncate block max-w-[200px]">{{ doctorDid }}</span></span>
          <button @click="handleLogout" class="text-xs text-red-600 hover:underline">New Patient / Logout</button>
        </div>
        
        <div class="mb-6 p-3 rounded-md bg-green-50 border border-green-200 text-center">
          <span class="text-sm font-medium text-green-800">✓ Patient identity verified via SSI</span>
        </div>

        <AlertBox v-if="issueError" type="error" :message="issueError" class="mb-6" />

        <BaseForm
          :isLoading="isLoading"
          submitText="Issue Prescription"
          @submit="handleIssue"
          >
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Patient DID</label>
              <input v-model="form.patientDid" type="text" readonly class="block w-full rounded-md border-slate-200 shadow-sm text-slate-500 sm:text-sm p-2.5 border bg-slate-100 cursor-not-allowed" title="Extracted from verified credential" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input v-model="form.name" type="text" readonly class="block w-full rounded-md border-slate-200 shadow-sm text-slate-500 sm:text-sm p-2.5 border bg-slate-100 cursor-not-allowed" title="Extracted from verified credential" />
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

      <IssuanceOfferModal 
        :isOpen="!!offerUrl"
        :isIssued="isIssued"
        :offerUrl="offerUrl"
        :qrCodeDataUrl="qrCodeDataUrl"
        credentialName="prescription"
        actionButtonText="Create New Prescription"
        @close="resetFlow"
      />
    </div>
  </div>
</template>

<script setup>
const { did: doctorDid, isLoggedIn, isLoggingIn, authError, login, logout } = useDidAuth('doctor')
const { isVerified, verificationUrl, verificationQrCode, errorMessage: verificationError, verifiedData, startVerification, resetVerification } = useSsiVerification()
const { isLoading, offerUrl, generatedVcId, errorMessage: issueError, issuePrescription, reset: resetIssuer } = usePrescriptionIssuer()

const { qrCodeDataUrl } = useQrCode(offerUrl)
const { isConfirmed: isIssued, stopPolling } = useBlockchainPolling(
  generatedVcId, 
  (id) => `/api/blockchain/prescription/${id}`
)

const form = ref({ 
  patientDid: '', 
  name: '', 
  medication: '', 
  refills: 0, 
  expirationDate: '' })


const handleLogin = async (inputDid) => {
  const success = await login(inputDid)
  if (success) startVerification('PatientIdentityCredential')
}

watch(isVerified, (verified) => {
  if (verified && verifiedData.value) {
    form.value.name = verifiedData.value.credentialSubject.name || 'Error extracting name'
    form.value.patientDid = verifiedData.value.credentialSubject.id || 'Error extracting DID'
  }
})

const handleIssue = async () => {
  await issuePrescription({ 
    ...form.value, 
    expirationDate: new Date(form.value.expirationDate).toISOString(),
    doctorDid: doctorDid.value 
  })
}

const handleLogout = () => {
  logout()
  resetVerification()
  resetFlow()
}

const resetFlow = () => {
  resetIssuer()
  stopPolling()
  form.value.medication = ''
  form.value.refills = 0
  form.value.expirationDate = ''
}
</script>