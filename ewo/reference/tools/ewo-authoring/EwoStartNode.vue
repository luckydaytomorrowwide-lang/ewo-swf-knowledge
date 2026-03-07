<template>
  <div
    class="ewo-start-node"
    :class="{ selected }"
  >
    <div class="node-header">
      <span class="node-icon">▶</span>
      <span class="node-label">Workflow Start</span>
    </div>

    <div class="node-section">
      <div class="section-label">Workflow Inputs</div>
      <div
        v-if="data.inputs && data.inputs.length > 0"
        class="param-list"
      >
        <div
          v-for="input in data.inputs"
          :key="input.name"
          class="param-row"
        >
          <div class="param-flow">
            <span class="param-name">{{ input.name }}</span>
            <span class="param-type-tag">{{ input.type || 'any' }}</span>
          </div>
          <Handle
            :id="`output-${input.name}`"
            type="source"
            :position="Position.Right"
            class="param-handle output-handle"
          />
        </div>
      </div>
      <div v-else class="empty-state">No inputs defined</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    inputs?: Array<{ name: string; type?: string; description?: string; required?: boolean }>
  }
  selected?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.ewo-start-node {
  background: white;
  border: 2px solid #10b981;
  border-radius: 8px;
  min-width: 180px;
  max-width: 240px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ewo-start-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ewo-start-node.selected {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.node-header {
  padding: 6px 10px;
  background: #ecfdf5;
  border-bottom: 1px solid #a7f3d0;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-icon {
  font-size: 13px;
  color: #059669;
}

.node-label {
  font-weight: 700;
  color: #065f46;
}

.node-section {
  padding: 6px 0;
}

.section-label {
  padding: 2px 10px;
  font-size: 9px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.param-list {
  padding: 2px 0;
}

.param-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 10px;
  position: relative;
}

.param-flow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-name {
  font-weight: 600;
  color: #065f46;
}

.param-type-tag {
  font-size: 9px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0 4px;
  border-radius: 2px;
}

.empty-state {
  padding: 8px 10px;
  color: #9ca3af;
  font-style: italic;
  font-size: 10px;
}

.param-handle {
  width: 10px;
  height: 10px;
  border: 2px solid white;
  border-radius: 50%;
  transition: all 0.15s;
}

.param-handle:hover {
  width: 12px;
  height: 12px;
}

.output-handle {
  background: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}
</style>
