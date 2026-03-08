<template>
  <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
    <h3 class="text-lg font-medium text-slate-900 mb-4">{{ title }}</h3>
    <p class="text-sm text-slate-500 mb-6">{{ description }}</p>
    
    <div v-if="error" class="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
      <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
      <div class="mt-2 text-sm text-red-700">{{ error }}</div>
    </div>

    <form @submit.prevent="onSubmit">
      <label class="block text-sm font-medium text-slate-700 mb-1">{{ inputLabel }}</label>
      <input 
        v-model="did" 
        type="text" 
        :placeholder="placeholder" 
        required 
        class="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border bg-slate-50 mb-6" 
      />
      <Button type="submit" :loading="loading">Authenticate</Button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: 'Insert your DID to access the system.' },
  inputLabel: { type: String, required: true },
  placeholder: { type: String, default: 'did:key:...' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['submit'])
const did = ref('')

const onSubmit = () => {
  if (did.value.trim()) {
    emit('submit', did.value)
  }
}
</script>