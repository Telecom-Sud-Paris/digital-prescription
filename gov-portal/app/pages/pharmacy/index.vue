<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Pharmacy Portal</h2>
        <p class="mt-2 text-sm text-slate-600">
          Verify on-chain prescriptions via SSI and dispense medications.
        </p>
      </div>

      <div v-if="!isLoggedIn" class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Dispenser Access</h3>
        <p class="text-sm text-slate-500 mb-6">Insert your DID to access the system.</p>
        
        <div v-if="authError" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ authError }}</div>
        </div>

        <form @submit.prevent="login">
          <label class="block text-sm font-medium text-slate-700 mb-1">Your DID (Authorized Pharmacy)</label>
          <input v-model="pharmacyDid" type="text" placeholder="did:key:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50 mb-6" />
          <Button type="submit" :loading="isLoggingIn">Authenticate</Button>
        </form>
      </div>

      <div v-else-if="!isVerified" class="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
        <div class="flex justify-between items-center mb-6 px-2">
          <span class="text-sm text-slate-600 font-medium">Pharmacy: <span class="text-teal-700 truncate block max-w-[200px]">{{ pharmacyDid }}</span></span>
          <button @click="resetSession" class="text-xs text-red-600 hover:underline">Logout</button>
        </div>

        <h3 class="text-lg font-medium text-slate-900 mb-2">Scan Prescription</h3>
        <p class="text-sm text-slate-500 mb-6">Ask the patient to scan this QR Code to present their MedicationRequestCredential.</p>

        <div v-if="verificationError" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-left">
          <h3 class="text-sm font-medium text-red-800">Verification Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ verificationError }}</div>
        </div>

        <div class="mt-6 flex justify-center">
          <img v-if="verificationQrCode" :src="verificationQrCode" alt="Verification QR Code" class="border border-slate-200 rounded-lg p-2 bg-white shadow-sm" />
          <div v-else class="animate-pulse bg-slate-200 w-[200px] h-[200px] rounded-lg flex items-center justify-center text-slate-500 text-sm">
            Generating Request...
          </div>
        </div>
        <div v-if="verificationUrl" class="bg-slate-50 p-3 mt-4 border border-slate-200 rounded break-all text-xs text-slate-700 font-mono select-all text-left max-h-32 overflow-y-auto">
          {{ verificationUrl }}
        </div>
        <p v-if="verificationQrCode" class="text-xs text-slate-400 mt-4 animate-pulse">Waiting for wallet presentation...</p>
      </div>

      <div v-else class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-6 px-2">
          <span class="text-sm text-slate-600 font-medium">Pharmacy: <span class="text-teal-700 truncate block max-w-[200px]">{{ pharmacyDid }}</span></span>
          <button @click="resetSession" class="text-xs text-red-600 hover:underline">New Patient / Logout</button>
        </div>
        
        <div class="mb-6 p-3 rounded-md bg-green-50 border border-green-200 text-center">
          <span class="text-sm font-medium text-green-800">✓ Prescription verified via SSI</span>
        </div>

        <div v-if="dispenseError" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 class="text-sm font-medium text-red-800">Dispense Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ dispenseError }}</div>
        </div>

        <div v-if="dispenseSuccess" class="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <h3 class="text-sm font-medium text-green-800">Success</h3>
          <div class="mt-2 text-sm text-green-700">Medication successfully dispensed and recorded on the blockchain.</div>
        </div>

        <div class="space-y-6">
          <div class="bg-slate-50 p-4 rounded-md border border-slate-200">
             <h4 class="text-sm font-bold text-slate-800 mb-2">Prescription Details (From VC)</h4>
             <p class="text-sm text-slate-600"><span class="font-medium">Patient:</span> {{ verifiedData?.id }}</p>
             <p class="text-sm text-slate-600"><span class="font-medium">Medication:</span> {{ verifiedData?.medication?.concept?.coding?.[0]?.display || 'N/A' }}</p>
             <p class="text-sm text-slate-600"><span class="font-medium">Refills Allowed:</span> {{ verifiedData?.dispenseRequest?.numberOfRepeatsAllowed }}</p>
          </div>

          <div v-if="blockchainPrescription">
            <div v-if="blockchainPrescription.status !== 'completed'">
              <form @submit.prevent="handleDispense">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 mb-1">Product Twin Link (Batch/Item ID)</label>
                  <input v-model="productLink" type="text" placeholder="urn:epc:id:sgtin:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50" />
                </div>
                <Button type="submit" :loading="isLoading" class="w-full">Confirm Dispense</Button>
              </form>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-red-600 font-medium">This prescription is already completed on the blockchain and can't be dispensed anymore.</p>
            </div>
          </div>
          
          <div v-else class="text-center py-4">
             <p class="text-slate-500 text-sm animate-pulse">Checking blockchain status for this prescription...</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const { isLoading, errorMessage: dispenseError, prescription: blockchainPrescription, dispenseSuccess, getPrescription, dispense, reset: resetDispense } = usePharmacy()
const { isVerified, verificationUrl, verificationQrCode, errorMessage: verificationError, verifiedData, startVerification, resetVerification } = useSsiVerification()

const isLoggedIn = ref(false)
const pharmacyDid = ref('')
const isLoggingIn = ref(false)
const authError = ref('')
const productLink = ref('')

const login = async () => {
  if (pharmacyDid.value.trim() === '') return
  isLoggingIn.value = true
  authError.value = ''
  try {
    await $fetch(`/api/blockchain/trust-registry/${encodeURIComponent(pharmacyDid.value)}/validate`, {
      params: { role: 'pharmacy' }
    })
    isLoggedIn.value = true
    
    // Inicia verificação do paciente após o login
    await startVerification('PrescriptionCredential')
  } catch (e) {
    authError.value = e.data?.statusMessage || 'Access Denied: Invalid DID or missing Pharmacy credentials.'
  } finally {
    isLoggingIn.value = false
  }
}

// Quando a credencial for verificada, busca o status atualizado na blockchain
watch(isVerified, async (verified) => {
  if (verified && verifiedData.value) {
    // Nota: você precisa garantir que o VC id está sendo repassado ou extraído corretamente
    // Se o seu VC joga o ID num campo específico, ajuste abaixo. Exemplo:
    const vcId = verifiedData.value.jti || verifiedData.value.id || 'urn:uuid:123' 
    await getPrescription(vcId)
  }
})

const handleDispense = async () => {
  await dispense(blockchainPrescription.value.id, pharmacyDid.value, productLink.value)
}

const resetSession = () => {
  isLoggedIn.value = false
  pharmacyDid.value = ''
  authError.value = ''
  productLink.value = ''
  resetVerification()
  resetDispense()
}
</script>