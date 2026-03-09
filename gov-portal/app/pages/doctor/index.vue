<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto">  
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Portal</h2>
        <p class="mt-2 text-sm text-slate-600">Issue digital prescriptions for your patients.</p>
      </div>
     <SsiQrVerification 
        v-if="!isLoggedIn"
        actorRole="Portal"
        actorDid="Portal Governance"
        title="Doctor Login"
        description="Scan this QR code with your wallet to present your Healthcare Professional Credential."
        :qrCodeUrl="loginVerification.verificationQrCode.value"
        :verificationUrl="loginVerification.verificationUrl.value"
        :error="loginVerification.errorMessage.value || authError"
        @cancel="handleLogout"
      />
      <SsiQrVerification 
        v-else-if="!patientVerification.isVerified.value"
        actorRole="Doctor"
        :actorDid="doctorDid"
        title="Patient Verification"
        description="Ask the patient to scan this QR Code to present their PatientCredential."
        :qrCodeUrl="patientVerification.verificationQrCode.value"
        :verificationUrl="patientVerification.verificationUrl.value"
        :error="patientVerification.errorMessage.value"
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
            <BaseInput 
              label="Patient DID" 
              v-model="form.patientDid" 
              readonly 
              title="Extracted from verified credential" 
            />
            <BaseInput 
              label="Name" 
              v-model="form.name" 
              readonly 
              title="Extracted from verified credential" 
            />
            <BaseInput 
              label="Medication (Composition/Name)" 
              v-model="form.medication" 
              placeholder="Ex: Amoxiciline 500mg" 
              required 
            />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput 
              label="Refills" 
              v-model="form.refills" 
              placeholder="0" 
              required 
              type="number" 
              min="0" 
            />
            <BaseInput 
              label="Validity" 
              v-model="form.expirationDate" 
              type="date" 
              required 
            />
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
const { did: doctorDid, isLoggedIn, authError, loginWithVc, logout } = useDidAuth('doctor')
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


const loginVerification = useSsiVerification()
const patientVerification = useSsiVerification()

//login qrcode for the doctor, needs to verify his vc and then check on chain if the vc is valid for login
onMounted(() => {
  loginVerification.startVerification('HealthcareProfessionalCredential')
})

//watches the login verification, if success, starts the patient verification qr code
watch(loginVerification.isVerified, async (verified) => {
  if (verified && loginVerification.verifiedData.value) {
    const vcData = loginVerification.verifiedData.value
    const extractedDid = vcData.credentialSubject.id
    const credentialId = vcData.id

    //check both registries (Trust Registry and Revocation Registry)
    const success = await loginWithVc(extractedDid, credentialId)
    
    if (success) {
       // If the doctor logs in successfully, start the QR Code for the Patient
       patientVerification.startVerification('PatientIdentityCredential')
    } else {
       // If the login fails (e.g., not in trust registry or credential revoked), reset and show the login QR code again
       loginVerification.resetVerification()
       loginVerification.startVerification('HealthcareProfessionalCredential')
    }
  }
})

//watches the patient verification, if success, extracts the patient DID and name from the VC to pre-fill the prescription form
watch(patientVerification.isVerified, (verified) => {
  if (verified && patientVerification.verifiedData.value) {
    form.value.name = patientVerification.verifiedData.value.credentialSubject.name || 'Error extracting name'
    form.value.patientDid = patientVerification.verifiedData.value.credentialSubject.id || 'Error extracting DID'
  }
})

const handleLogout = () => {
  logout()
  loginVerification.resetVerification()
  patientVerification.resetVerification()
  loginVerification.startVerification('HealthcareProfessionalCredential')
  resetFlow()
}

const handleIssue = async () => {
  await issuePrescription({ 
    ...form.value, 
    expirationDate: new Date(form.value.expirationDate).toISOString(),
    doctorDid: doctorDid.value 
  })
}



const resetFlow = () => {
  resetIssuer()
  stopPolling()
  form.value.medication = ''
  form.value.refills = 0
  form.value.expirationDate = ''
}
</script>