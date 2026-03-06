<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-10">
        <h1 class="text-3xl font-bold text-slate-800">My SSI Wallet</h1>
        <NuxtLink to="/" class="text-blue-600 font-medium hover:underline">Home</NuxtLink>
      </div>

      <div v-if="!isLoggedIn" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Access your Wallet</h2>
        <p class="text-slate-500 mb-6 text-sm">Enter your DID to access your verifiable credentials.</p>
        
        <input v-model="inputDid" type="text" class="w-full rounded-md border-slate-300 p-3 bg-slate-50 mb-4 border" placeholder="did:key:z6Mk..." />
        
        <button @click="loginWithDid" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Access Wallet
        </button>

        <div class="mt-6 pt-6 border-t border-slate-100">
          <p class="text-sm text-slate-500 mb-3">Don't have a DID?</p>
          <button @click="generateNewDid" class="text-blue-600 font-bold hover:underline">
            Generate a new DID
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Wallet DID</p>
            <p class="font-mono text-slate-800 mt-1">{{ activeDid }}</p>
          </div>
          <button @click="logout" class="text-red-500 font-medium hover:underline text-sm">Disconnect</button>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800">My Credentials</h2>
            <button @click="fetchCredentials" class="text-sm bg-slate-100 px-3 py-1 rounded text-slate-600 hover:bg-slate-200">
              ↻ Refresh
            </button>
          </div>

          <div v-if="loadingCreds" class="text-center py-8 text-slate-500">Loading your credentials...</div>
          
          <div v-else-if="credentials.length === 0" class="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
            No credentials found for this DID.
          </div>

          <div v-else class="grid gap-4">
            <div v-for="(cred, index) in credentials" :key="index" class="p-5 border rounded-lg bg-slate-50 hover:bg-white hover:shadow-md transition">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-bold text-slate-800">{{ cred.type ? cred.type[1] : 'Credential' }}</h3>
                  <p class="text-xs text-slate-500 mt-1">ID: {{ cred.id }}</p>
                  <p class="text-xs text-slate-500 mt-1">Issuer: {{ cred.issuer }}</p>
                </div>
                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded h-fit font-bold">Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoggedIn = ref(false)
const inputDid = ref('')
const activeDid = ref('')
const credentials = ref([])
const loadingCreds = ref(false)

const loginWithDid = async () => {
  if (!inputDid.value) return;
  activeDid.value = inputDid.value;
  isLoggedIn.value = true;
  await fetchCredentials();
}

const logout = () => {
  isLoggedIn.value = false;
  activeDid.value = '';
  credentials.value = [];
}

const generateNewDid = async () => {
  try {
    const response = await $fetch('/api/wallet/create-did', { method: 'POST' });
    inputDid.value = response.did;
    alert('DID Generated! You can now log in.');
  } catch (e) {
    alert(e.message);
  }
}

const fetchCredentials = async () => {
  loadingCreds.value = true;
  try {
    const data = await $fetch(`/api/wallet/credentials`, { 
      params: { did: activeDid.value } 
    });
    credentials.value = data || [];
  } catch (e) {
    console.error('Failed to fetch credentials', e);
  } finally {
    loadingCreds.value = false;
  }
}
</script>