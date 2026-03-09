<template>
  <div class="p-8 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">DID Generator</h1>
    <p class="text-sm text-gray-600 mb-5">This generator is used for test purposes. In a real application, the DID would be generated in your own wallet. </p>
    
    <div class="flex gap-4 mb-6">
      <Button @click="generate" :loading="loading1">1. Create DID (JWK)</Button>
      <Button @click="getKey" :disabled="!result?.did" :loading="loading2">2. Get Key</Button>  
    </div>

    <div v-if="result" class="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-4 rounded border border-gray-200">
        <div class="flex-1 min-w-0"> 
          <p class="text-sm font-semibold text-gray-600 mb-1">DID:</p>
          <input 
            type="text" 
            readonly 
            :value="result.did" 
            class="w-full bg-gray-50 border mb-5 border-gray-200 rounded px-2 py-1 text-blue-600 font-mono text-sm outline-none cursor-text" 
          />
          <Button @click="copyDid" class="text-xs px-3 py-1.5 h-auto whitespace-nowrap shrink-0">
          Copy DID
          </Button>  
        </div>
        
      
      </div>

      <div v-if="key" class="bg-white p-4 rounded border border-gray-200">
        <p class="text-sm font-semibold text-gray-600 mb-2">Key Material:</p>
        <pre class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs font-mono shadow-inner">{{ JSON.stringify(key, null, 2) }}</pre>
      </div>
      
      <div class="bg-white p-4 rounded border border-gray-200">
        <p class="text-sm font-semibold text-gray-600 mb-2">DID Document:</p>
        <pre class="bg-gray-900 text-blue-300 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto text-xs font-mono shadow-inner">{{ JSON.stringify(result.didDocument, null, 2) }}</pre>
      </div>
      
    </div>
  </div>
</template>

<script setup>
const loading1 = ref(false);
const loading2 = ref(false);
const result = ref(null);
const key = ref(null);
 
async function generate() {
  loading1.value = true;
  key.value = null; 
  try {
    result.value = await $fetch('/api/did/generate', { method: 'POST' });
  } finally {
    loading1.value = false;
  }
}

async function getKey(){
  if (!result.value?.did) return;
  
  loading2.value = true;
  try {
    key.value = await $fetch('/api/did/key', { 
      method: 'POST', 
      body: { did: result.value.did } 
    });
    key.value=key.value.publicKey
  } finally {
    loading2.value = false;
  }
}

function copyDid() {
  if (result.value?.did) {
    navigator.clipboard.writeText(result.value.did);
    alert('DID copied!');
  }
}
</script>