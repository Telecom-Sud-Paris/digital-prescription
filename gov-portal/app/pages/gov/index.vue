<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-slate-800">Government Credential Portal</h1>
        <p class="text-slate-500 mt-2">National Trust Registry & VC Issuer</p>
      </div>

      <div class="flex space-x-1 bg-slate-200 p-1 rounded-xl mb-8">
        <button @click="activeTab = 'citizen'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors', activeTab === 'citizen' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900']">
          Patient Identity
        </button>
        <button @click="activeTab = 'doctor'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors', activeTab === 'doctor' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900']">
          Healthcare Professional
        </button>
        <button @click="activeTab = 'pharmacy'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors', activeTab === 'pharmacy' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900']">
          Authorized Pharmacy
        </button>
      </div>

      <div v-if="activeTab === 'citizen'" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-semibold mb-4 text-slate-800">Request Patient Identity VC</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" placeholder="John Doe" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">National ID (SSN)</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" placeholder="123-456-789" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Your DID (from Wallet)</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" placeholder="did:key:..." />
          </div>
          <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">
            Issue Identity Credential
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'doctor'" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-semibold mb-4 text-slate-800">Healthcare Professional Onboarding</h2>
        <p class="text-sm text-slate-500 mb-6">Issues VC and registers your DID in the Trusted Issuer Blockchain Registry.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Medical License Number</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="MD-887766" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Your DID</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="did:key:doctor..." />
          </div>
          <button class="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition font-medium">
            Register as Doctor & Issue VC
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'pharmacy'" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-semibold mb-4 text-slate-800">Pharmacy Onboarding</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Institution Name</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="Central Pharmacy" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Institution DID</label>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 p-2 border" placeholder="did:key:pharmacy..." />
          </div>
          <button class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-medium">
            Register as Dispenser & Issue VC
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('citizen')
</script>