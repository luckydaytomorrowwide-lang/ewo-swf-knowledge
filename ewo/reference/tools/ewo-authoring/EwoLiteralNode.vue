<template>
  <div
    class="ewo-literal-node"
    :class="{ selected }"
  >
    <div class="literal-header">
      <span class="literal-icon">📌</span>
      <span class="literal-type">{{ data.valueType }}</span>
    </div>
    <div class="literal-value">
      <div class="value-display">{{ displayValue }}</div>
    </div>
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="literal-handle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    value: any
    valueType: string
  }
  selected?: boolean
}

const props = defineProps<Props>()

const displayValue = computed(() => {
  const val = props.data.value
  if (typeof val === 'string') {
    return val.length > 20 ? `"${val.substring(0, 20)}..."` : `"${val}"`
  }
  if (typeof val === 'object') {
    const str = JSON.stringify(val)
    return str.length > 20 ? str.substring(0, 20) + '...' : str
  }
  return String(val)
})
</script>

<style scoped>
.ewo-literal-node {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 8px;
  min-width: 100px;
  max-width: 150px;
  font-size: 11px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ewo-literal-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.ewo-literal-node.selected {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.literal-header {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #f59e0b;
  background: rgba(255, 255, 255, 0.3);
}

.literal-icon {
  font-size: 12px;
}

.literal-type {
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.5px;
}

.literal-value {
  padding: 8px;
}

.value-display {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #78350f;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.3;
}

.literal-handle {
  width: 10px;
  height: 10px;
  border: 2px solid white;
  background: #f59e0b;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #f59e0b;
  transition: all 0.2s;
}

.literal-handle:hover {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 2px #f59e0b;
}
</style>
