<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Pharmacy Portal</h2>
        <p class="mt-2 text-sm text-slate-600">Verify on-chain prescriptions via SSI and dispense medications.</p>
      </div>
      <SsiQrVerification 
        v-if="!isLoggedIn"
        actorRole="Portal"
        actorDid="Portal Governance"
        title="Pharmacy Login"
        description="Scan this QR code with your wallet to present your Authorized Pharmacy Credential."
        :qrCodeUrl="loginVerification.verificationQrCode.value"
        :verificationUrl="loginVerification.verificationUrl.value"
        :error="loginVerification.errorMessage.value || authError"
        @cancel="handleLogout"
      />
      <SsiQrVerification 
        v-else-if="!prescriptionVerification.isVerified.value"
        actorRole="Pharmacy"
        :actorDid="pharmacyDid"
        title="Scan Prescription"
        description="Ask the patient to scan this QR Code to present their PrescriptionCredential."
        :qrCodeUrl="prescriptionVerification.verificationQrCode.value"
        :verificationUrl="prescriptionVerification.verificationUrl.value"
        :error="prescriptionVerification.errorMessage.value"
        @cancel="handleLogout"
      />
      <div v-else class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <span class="text-sm text-slate-600 font-medium">Pharmacy: <span class="text-teal-700 truncate block max-w-[200px]">{{ pharmacyDid }}</span></span>
          <button @click="handleLogout" class="text-xs text-red-600 hover:underline">Logout</button>
        </div>
        <div class="p-3 rounded-md bg-green-50 border border-green-200 text-center">
          <span class="text-sm font-medium text-green-800">✓ Prescription verified via SSI</span>
        </div>
        <AlertBox v-if="dispenseError" type="error" :message="dispenseError" />
        <AlertBox v-if="dispenseSuccess" type="success" message="Medication successfully dispensed and recorded on the blockchain." />
        <div v-if="prescription" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all">
          <div class="p-6 border-b border-slate-100 bg-slate-50">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Prescription Found</h3>
                <p class="text-xs text-slate-500 font-mono mt-1">{{ prescription.id }}</p>
              </div>
              <span :class="prescription.status === 'active' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-800'" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase">
                {{ prescription.status }}
              </span>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-slate-500 mb-1">Doctor Issuer</p>
                <p class="font-medium text-slate-900 truncate" :title="prescription.issuerDID">{{ prescription.issuerDID }}</p>
              </div>
              <div>
                <p class="text-slate-500 mb-1">Validity</p>
                <p class="font-medium text-slate-900">{{ new Date(prescription.expirationDate).toLocaleDateString() }}</p>
              </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p class="text-slate-500 text-xs uppercase tracking-wider mb-1">Remaining Refills</p>
                <p class="text-2xl font-bold" :class="prescription.refillCounter > 0 ? 'text-teal-600' : 'text-red-600'">
                  {{ prescription.refillCounter }}
                </p>
              </div>
              <div v-if="prescription.productLinkID" class="text-right">
                <p class="text-slate-500 text-xs mb-1">Last Product Batch</p>
                <p class="font-mono text-sm text-slate-700">{{ prescription.productLinkID }}</p>
              </div>
            </div>
            <BaseForm 
              v-if="prescription.status === 'active' && prescription.refillCounter > 0" 
              flat
              :isLoading="isLoading"
              submitText="Confirm Dispense"
              @submit="handleDispense"
              class="pt-4 border-t border-slate-100"
            >
              <h4 class="text-md font-medium text-slate-900 mb-3">Dispense Medication</h4>
              <BaseInput 
              label="Physical Product ID" 
              v-model="productLink" 
              type="text" 
              placeholder="Ex: epc:id:sgtin:..."
              required 
              />
            </BaseForm>
            <div v-else class="text-center py-4">
              <p class="text-red-600 font-medium">This prescription is already completed and can't be dispensed anymore.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { did: pharmacyDid, isLoggedIn, authError, loginWithVc, logout } = useDidAuth('pharmacy')
const loginVerification = useSsiVerification()
const prescriptionVerification = useSsiVerification()
const { isLoading, errorMessage: dispenseError, prescription, dispenseSuccess, getPrescription, dispense, reset: resetDispense } = useDispenser()
const productLink = ref('')

//login qrcode for the pharmacy
onMounted(() => {
  loginVerification.startVerification('AuthorizedDispenserCredential')
})

//prescription verification after pharmacy login
watch(loginVerification.isVerified, async (verified) => {
  if (verified && loginVerification.verifiedData.value) {
    const vcData = loginVerification.verifiedData.value
    const extractedDid = vcData.credentialSubject.id
    const credentialId = vcData.id
    //check trust registry and revocation registry to confirm if the pharmacy is authorized
    const success = await loginWithVc(extractedDid, credentialId)
    if (success) {
      //release the qr code for the prescription verification
      prescriptionVerification.startVerification('PrescriptionCredential')
    } else {
      loginVerification.resetVerification()
      loginVerification.startVerification('AuthorizedDispenserCredential')
    }
  }
})

//patient scans the prescription qr code and pharmacy verifies it
watch(prescriptionVerification.isVerified, async (verified) => {
  if (verified && prescriptionVerification.verifiedData.value) {
    const vcId = prescriptionVerification.verifiedData.value.id || 'Error extracting credential id'
    await getPrescription(vcId)
  }
})

const handleDispense = async () => {
  if (prescription.value) {
    await dispense(prescription.value.id, prescription.value.issuerDID, pharmacyDid.value, productLink.value)
  }
}

const handleLogout = () => {
  logout()
  productLink.value = ''
  resetDispense()
  loginVerification.resetVerification()
  prescriptionVerification.resetVerification()
  loginVerification.startVerification('AuthorizedDispenserCredential')
}
</script>