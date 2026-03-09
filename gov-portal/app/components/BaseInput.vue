<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  readonly: { type: Boolean, default: false },
  placeholder: String,
  required: { type: Boolean, default: false },
  title: String
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">{{ label }}</label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :readonly="readonly"
      :placeholder="placeholder"
      :required="required"
      :title="title"
      class="block w-full rounded-md shadow-sm sm:text-sm p-2.5 border"
      :class="[
        readonly 
          ? 'border-slate-200 text-slate-500 bg-slate-100 cursor-not-allowed' 
          : 'border-slate-300 bg-slate-50 focus:border-teal-500 focus:ring-teal-500'
      ]"
    />
  </div>
</template>