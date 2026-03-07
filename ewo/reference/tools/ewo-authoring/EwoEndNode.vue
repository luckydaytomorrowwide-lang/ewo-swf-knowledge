<template>
  <div
    class="ewo-end-node"
    :class="{ selected }"
  >
    <div class="node-header">
      <span class="node-icon">⬛</span>
      <span class="node-label">Workflow End</span>
    </div>

    <div class="node-section">
      <div class="section-label">Workflow Outputs</div>
      <div
        v-if="data.outputs && data.outputs.length > 0"
        class="param-list"
      >
        <div
          v-for="output in data.outputs"
          :key="output.name"
          class="param-row"
        >
          <Handle
            :id="`input-${output.name}`"
            type="target"
            :position="Position.Left"
            class="param-handle input-handle"
          />
          <div class="param-flow">
            <span class="param-name">{{ output.name }}</span>
            <span class="param-type-tag">{{ output.type || 'any' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">No outputs defined</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    label?: string
    outputs?: Array<{ name: string; type?: string }>
  }
  selected?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.ewo-end-node {
  background: white;
  border: 2px solid #ef4444;
  border-radius: 8px;
  min-width: 180px;
  max-width: 240px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ewo-end-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ewo-end-node.selected {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.node-header {
  padding: 6px 10px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-icon {
  font-size: 13px;
  color: #dc2626;
}

.node-label {
  font-weight: 700;
  color: #991b1b;
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
  color: #991b1b;
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

.input-handle {
  background: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}
</style>
