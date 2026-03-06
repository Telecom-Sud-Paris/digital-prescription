<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Pharmacy Portal</h2>
        <p class="mt-2 text-sm text-slate-600">
          Verify on-chain prescriptions and make dispense.
        </p>
      </div>

      <div v-if="!isLoggedIn" class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Dispenser Access</h3>
        <form @submit.prevent="login">
          <label class="block text-sm font-medium text-slate-700 mb-1">Your DID (Authorized Pharmacy)</label>
          <input v-model="pharmacyDid" type="text" placeholder="did:key:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50 mb-6" />
          <Button type="submit">Authenticate</Button>
        </form>
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-6 px-2">
          <span class="text-sm text-slate-600 font-medium">Pharmacy: <span class="text-teal-700 truncate block max-w-[200px]">{{ pharmacyDid }}</span></span>
          <button @click="isLoggedIn = false; reset()" class="text-xs text-red-600 hover:underline">Logout</button>
        </div>

        <div v-if="errorMessage" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 class="text-sm font-medium text-red-800">error</h3>
          <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
        </div>

        <div v-if="dispenseSuccess" class="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-center">
          <svg class="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-green-800">Dispense registered on the Blockchain!</h3>
            <p class="text-xs text-green-700">State was updated on the blockchain.</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
  <h3 class="text-md font-medium text-slate-900 mb-4">1. Scan patient's prescription.</h3>
  
  <form @submit.prevent="handleSearch" class="flex flex-col gap-4 w-full">
    
    <input 
      v-model="searchId" 
      type="text" 
      placeholder="Prescription ID (urn:uuid:rx-...)" 
      required 
      class="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-3 border bg-slate-50" 
    />

    <Button 
      type="submit" 
      :loading="isLoading" 
      class="w-full py-3 h-12 flex justify-center items-center"
    >
      Verify
    </Button>
  </form>
</div>

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
            <form v-if="prescription.status === 'active' && prescription.refillCounter > 0" @submit.prevent="handleDispense" class="pt-4 border-t border-slate-100">
              <h4 class="text-md font-medium text-slate-900 mb-3">2. Dispense Medication</h4>
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-1">Physical Product ID</label>
                <input v-model="productLink" type="text" placeholder="Ex: epc:id:sgtin:..." required class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border bg-slate-50" />
              </div>
              
              <Button type="submit" :loading="isLoading" class="w-full">Confirme Dispense</Button>
            </form>

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
const { isLoading, errorMessage, prescription, dispenseSuccess, getPrescription, dispense, reset } = usePharmacy()
const isLoggedIn = ref(false)
const pharmacyDid = ref('')
const searchId = ref('')
const productLink = ref('')
const login = () => {
  if(pharmacyDid.value.trim() !== '') isLoggedIn.value = true
}

const handleSearch = async () => {
  await getPrescription(searchId.value.trim())
  productLink.value = '' 
}

const handleDispense = async () => {
  await dispense(prescription.value.id, pharmacyDid.value, productLink.value.trim())
  productLink.value = ''
}
</script>