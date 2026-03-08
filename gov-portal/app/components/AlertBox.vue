<template>
  <div v-if="message" :class="containerClasses">
    <div class="mt-2 text-sm" :class="textClasses">{{ message }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'error', validator: (v) => ['error', 'success'].includes(v) }
})

const containerClasses = computed(() => {
  return props.type === 'error'
    ? 'p-4 rounded-md bg-red-50 border border-red-200'
    : 'p-4 rounded-md bg-green-50 border border-green-200'
})

const textClasses = computed(() => {
  return props.type === 'error'
    ? 'text-red-700'
    : 'text-green-700'
})
</script>