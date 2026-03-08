<template>
  <form 
    @submit.prevent="$emit('submit')" 
    class="space-y-5"
    :class="{ 'bg-white p-8 rounded-xl shadow-sm border border-slate-100': !flat }"
  >
    <slot />

    <Button type="submit" :loading="isLoading" class="mt-6 w-full">
      {{ submitText }}
    </Button>
  </form>
</template>

<script setup>
defineProps({
  isLoading: { type: Boolean, default: false },
  submitText: { type: String, default: 'Send' },
  flat: { type: Boolean, default: false } // <-- Nova prop
})

defineEmits(['submit'])
</script>