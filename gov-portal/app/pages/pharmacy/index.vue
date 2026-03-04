<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-purple-800 text-white p-4 shadow-md">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Pharmacy Dispense Portal</h1>
        <div class="flex items-center space-x-4">
          <span v-if="isAuthenticated" class="text-sm bg-purple-900 px-3 py-1 rounded-full border border-purple-600">
            ✅ Authenticated: did:key:pharmacy789
          </span>
          <button v-else @click="isAuthenticated = true" class="bg-white text-purple-800 px-4 py-2 rounded text-sm font-bold shadow hover:bg-purple-50">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>

    <main v-if="isAuthenticated" class="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="font-bold text-slate-800 mb-2 text-lg">1. Verify Credentials</h2>
        <p class="text-sm text-slate-500 mb-6">Scan the Patient's ID (or Delegation) and the Prescription VC.</p>
        
        <div class="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition mb-6">
          <p class="text-slate-600 font-medium">Waiting for Wallet Presentation...</p>
          <button class="mt-4 bg-purple-100 text-purple-700 px-4 py-2 rounded text-sm font-medium">Simulate Receive VP</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-green-50 border border-green-200 rounded flex justify-between items-center">
            <span class="text-sm font-medium text-green-800">Identity / Delegation</span>
            <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Verified</span>
          </div>
          <div class="p-3 bg-green-50 border border-green-200 rounded flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-green-800">Prescription VC (urn:uuid:rx-2026...)</span>
              <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Verified</span>
            </div>
            <span class="text-xs text-slate-600">Amoxicillin 500mg - Status: Active - Refills: 1</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="font-bold text-slate-800 mb-2 text-lg">2. Dispense & Link Product</h2>
        <p class="text-sm text-slate-500 mb-6">Record the transaction on-chain and link the digital twin.</p>
        
        <form class="space-y-4" @submit.prevent>
          <div>
            <label class="block text-sm font-medium text-slate-700">Digital Twin / Product ID</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input type="text" class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-slate-300 bg-slate-50 focus:ring-purple-500 focus:border-purple-500" placeholder="Scan medicine barcode..." />
              <button type="button" class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-slate-500 text-sm hover:bg-slate-200">
                Scan
              </button>
            </div>
            <p class="text-xs text-slate-400 mt-1">This links the fulfillment to Project 1's architecture.</p>
          </div>
          
          <div class="bg-slate-50 p-4 rounded border border-slate-200 mt-4">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blockchain Transaction Preview</h3>
            <ul class="text-sm text-slate-700 space-y-1">
              <li><strong>Action:</strong> dispensePrescription</li>
              <li><strong>Prescription ID:</strong> urn:uuid:rx-2026-0001</li>
              <li><strong>Pharmacy DID:</strong> did:key:pharmacy789</li>
            </ul>
          </div>

          <div class="pt-4 mt-6">
            <button class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition font-bold shadow-md">
              Confirm Dispense
            </button>
          </div>
        </form>
      </div>

    </main>

    <div v-else class="flex justify-center items-center h-[80vh]">
      <div class="text-center text-slate-500">
        <p>Please connect your Pharmacy Wallet to access.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isAuthenticated = ref(false)
</script>