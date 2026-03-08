<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Pharmacy Portal</h2>
        <p class="mt-2 text-sm text-slate-600">Verify on-chain prescriptions via SSI and dispense medications.</p>
      </div>

      <DidLoginForm 
        v-if="!isLoggedIn"
        title="Dispenser Access"
        inputLabel="Your DID (Authorized Pharmacy)"
        :loading="isLoggingIn"
        :error="authError"
        @submit="handleLogin" 
      />

      <SsiQrVerification 
        v-else-if="!isVerified"
        actorRole="Pharmacy"
        :actorDid="pharmacyDid"
        title="Scan Prescription"
        description="Ask the patient to scan this QR Code to present their MedicationRequestCredential."
        :qrCodeUrl="verificationQrCode"
        :verificationUrl="verificationUrl"
        :error="verificationError"
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
              submitText="Confirme Dispense"
              @submit="handleDispense"
              class="pt-4 border-t border-slate-100"
            >
              <h4 class="text-md font-medium text-slate-900 mb-3">Dispense Medication</h4>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Physical Product ID</label>
                <input v-model="productLink" type="text" placeholder="Ex: epc:id:sgtin:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border bg-slate-50" />
              </div>
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
const { did: pharmacyDid, isLoggedIn, isLoggingIn, authError, login, logout } = useDidAuth('pharmacy')
const { isVerified, verificationUrl, verificationQrCode, errorMessage: verificationError, verifiedData, startVerification, resetVerification } = useSsiVerification()
const { isLoading, errorMessage: dispenseError, prescription, dispenseSuccess, getPrescription, dispense, reset: resetDispense } = useDispenser()

const productLink = ref('')

const handleLogin = async (inputDid) => {
  const success = await login(inputDid)
  if (success) startVerification('PrescriptionCredential')
}

watch(isVerified, async (verified) => {
  if (verified && verifiedData.value) {
    console.log(verifiedData.value)
    const vcId = verifiedData.value.id || 'Error extracting credential id'
    await getPrescription(vcId)
  }
})
console.log('Prescription:', prescription.value)
const handleDispense = async () => {
  await dispense(prescription.value.id, prescription.value.issuerDID, pharmacyDid.value, productLink.value)
}

const handleLogout = () => {
  logout()
  productLink.value = ''
  resetVerification()
  resetDispense()
}
</script>