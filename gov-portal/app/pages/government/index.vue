<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Government Credential Issuer Portal
        </h2>
      </div>
      <AlertBox v-if="errorMessage" type="error" :message="errorMessage" class="mb-6" />
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
        <BaseInput 
              label="Subject DID" 
              v-model="form.subjectDid" 
              required 
              placeholder="did:key:..."
            />
        <BaseInput 
              label="name" 
              v-model="form.name" 
              required 
              placeholder="Ex: John Doe"
            />
      </BaseForm>
      <IssuanceOfferModal 
        :isOpen="!!offerUrl"
        :isIssued="isIssued"
        :offerUrl="offerUrl"
        :qrCodeDataUrl="qrCodeDataUrl"
        :credentialName="form.credentialType"
        actionButtonText="Create New Credential"
        @close="resetFlow"
      />

    </div>
  </div>
</template>

<script setup>
const { isLoading, offerUrl, generatedVcId, errorMessage, issue, reset: resetIssuer } = useCredentialIssuer()

const form = ref({
  credentialType: '',
  subjectDid: '',
  name: ''
})

const { qrCodeDataUrl } = useQrCode(offerUrl)

const { isConfirmed: isIssued, stopPolling } = useBlockchainPolling(
  generatedVcId, 
  (id) => `/api/blockchain/revocation-registry/${id}`
)

const handleIssue = async () => {
  await issue({ ...form.value })
}

const resetFlow = () => {
  resetIssuer() 
  stopPolling()
  form.value.credentialType = ''
  form.value.subjectDid = ''
  form.value.name = ''
}
</script>