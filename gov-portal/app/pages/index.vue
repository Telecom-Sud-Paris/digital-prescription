<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">SSI Health</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <NuxtLink to="/government" class="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-600">
        <h2 class="text-2xl font-semibold mb-2">Government Portal</h2>
        <p class="text-gray-600">Issuance of VCs for patient, doctor and pharmacies.</p>
      </NuxtLink>

      <NuxtLink to="/doctor" class="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-green-600">
        <h2 class="text-2xl font-semibold mb-2">Doctor Portal</h2>
        <p class="text-gray-600">Issue prescriptions.</p>
      </NuxtLink>

      <NuxtLink to="/pharmacy" class="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-purple-600">
        <h2 class="text-2xl font-semibold mb-2">Pharmacy Portal</h2>
        <p class="text-gray-600">Verify prescriptions and Dispense medication.</p>
      </NuxtLink>

      <NuxtLink to="/generate-did" class="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-pink-600">
        <h2 class="text-2xl font-semibold mb-2">DID Generator</h2>
        <p class="text-gray-600">Generate your own DID (simulates what your wallet would do).</p>
      </NuxtLink>
    </div>
  </div>
</template>