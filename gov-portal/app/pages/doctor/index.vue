<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-emerald-700 text-white p-4 shadow-md">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Doctor Portal</h1>
        <div class="flex items-center space-x-4">
          <span v-if="isAuthenticated" class="text-sm bg-emerald-800 px-3 py-1 rounded-full border border-emerald-600">
            ✅ Authenticated: did:key:doctor456
          </span>
          <button v-else @click="isAuthenticated = true" class="bg-white text-emerald-700 px-4 py-2 rounded text-sm font-bold shadow hover:bg-emerald-50">
            Connect Wallet (Login)
          </button>
        </div>
      </div>
    </header>

    <main v-if="isAuthenticated" class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div class="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h2 class="font-bold text-slate-800 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
          Scan Patient ID
        </h2>
        <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
          <p class="text-sm text-slate-500">Request VP from Patient Wallet</p>
          <button class="mt-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded text-sm font-medium w-full">Simulate Scan</button>
        </div>
        
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-xs text-blue-600 font-bold uppercase">Verified Patient</p>
          <p class="text-sm font-medium text-slate-800 mt-1">John Doe (123-456-789)</p>
          <p class="text-xs text-slate-500 truncate">did:key:patient123</p>
        </div>
      </div>

      <div class="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="font-bold text-slate-800 mb-6 text-xl">Issue New Prescription</h2>
        <form class="space-y-4" @submit.prevent>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">Medication (Concept)</label>
              <input type="text" class="mt-1 w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="Amoxicillin 500mg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Quantity / Unit</label>
              <div class="flex space-x-2 mt-1">
                <input type="number" class="w-1/2 rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="21" />
                <input type="text" class="w-1/2 rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="capsules" />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Dosage Instructions</label>
            <input type="text" class="mt-1 w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="Take one capsule three times daily for 7 days" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">Refills Allowed</label>
              <input type="number" class="mt-1 w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Expiration Date</label>
              <input type="date" class="mt-1 w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" />
            </div>
          </div>
          
          <div class="pt-4 border-t mt-6">
            <button class="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition font-bold shadow-md">
              Sign VC & Register on Blockchain
            </button>
          </div>
        </form>
      </div>
    </main>

    <div v-else class="flex justify-center items-center h-[80vh]">
      <div class="text-center text-slate-500">
        <p>Please connect your Wallet to access the portal.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isAuthenticated = ref(false)
</script>