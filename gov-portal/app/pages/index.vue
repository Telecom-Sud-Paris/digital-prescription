<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    
    <div class="text-center max-w-3xl mb-12">
      <div class="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Decentralized Prescription Protocol
      </h1>
      <p class="text-lg text-slate-600">
        A Blockchain-based protocol for state management and product linkage of medical prescriptions using Verifiable Credentials.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
      
      <NuxtLink to="/gov" class="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Government Portal</h2>
        <p class="text-sm text-slate-500 mb-6">
          Root of trust. Issue Patient Identity VCs and onboard Doctors & Pharmacies to the Trust Registry.
        </p>
        <span class="mt-auto text-blue-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
          Enter Portal <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
      </NuxtLink>

      <NuxtLink to="/doctor" class="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Doctor Portal</h2>
        <p class="text-sm text-slate-500 mb-6">
          Verify Patient IDs, generate new Prescription VCs, and register their state on the blockchain.
        </p>
        <span class="mt-auto text-emerald-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
          Enter Portal <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
      </NuxtLink>

      <NuxtLink to="/pharmacy" class="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Pharmacy Portal</h2>
        <p class="text-sm text-slate-500 mb-6">
          Verify prescriptions, process medications, update blockchain state, and link digital twins.
        </p>
        <span class="mt-auto text-purple-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
          Enter Portal <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
      </NuxtLink>

    </div>

    <div class="mt-16 text-slate-400 text-sm">
      <p>Hyperledger Fabric MVP • Nuxt 3 Frontend</p>
    </div>
  </div>
</template>