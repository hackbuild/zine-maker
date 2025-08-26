<template>
  <div class="number-input">
    <input 
      type="number"
      :value="value"
      @input="updateValue"
      @blur="validateValue"
      :min="min"
      :max="max"
      :step="step"
      class="number-field"
    />
    <span v-if="suffix" class="suffix">{{ suffix }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

interface Emits {
  update: [value: number];
}

const props = withDefaults(defineProps<Props>(), {
  min: undefined,
  max: undefined,
  step: 1,
  suffix: ''
});

const emit = defineEmits<Emits>();

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = parseFloat(target.value);
  if (!isNaN(value)) {
    emit('update', value);
  }
}

function validateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = parseFloat(target.value);
  
  if (isNaN(value)) {
    value = props.value;
  } else {
    if (props.min !== undefined && value < props.min) {
      value = props.min;
    }
    if (props.max !== undefined && value > props.max) {
      value = props.max;
    }
  }
  
  target.value = value.toString();
  emit('update', value);
}
</script>

<style scoped>
.number-input {
  display: flex;
  align-items: center;
  position: relative;
}

.number-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: right;
}

.number-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.suffix {
  position: absolute;
  right: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  pointer-events: none;
}

.number-field:focus + .suffix {
  color: #3b82f6;
}
</style>
