<template>
  <div
    class="ewo-ac-node"
    :class="{ selected }"
  >
    <div class="node-header">
      <span class="node-icon">{{ data.nodeType === 'workflow' ? '🔄' : '📦' }}</span>
      <span class="node-label">{{ data.label }}</span>
    </div>

    <div v-if="data.inputs && data.inputs.length > 0" class="node-section">
      <div class="section-label">Inputs</div>
      <div
        v-for="input in data.inputs"
        :key="input.name"
        class="param-row"
      >
        <Handle
          :id="`input-${input.name}`"
          type="target"
          :position="Position.Left"
          class="param-handle input-handle"
          :class="{ required: input.required }"
        />
        <div class="param-info">
          <span class="param-name">{{ input.name }}</span>
          <span class="param-type">{{ input.type }}</span>
        </div>
      </div>
    </div>

    <div v-if="data.outputs && data.outputs.length > 0" class="node-section">
      <div class="section-label">Outputs</div>
      <div
        v-for="output in data.outputs"
        :key="output.name"
        class="param-row output-row"
      >
        <div class="param-info text-right">
          <span class="param-type">{{ output.type }}</span>
          <span class="param-name">{{ output.name }}</span>
        </div>
        <Handle
          :id="`output-${output.name}`"
          type="source"
          :position="Position.Right"
          class="param-handle output-handle"
        />
      </div>
    </div>

    <div v-if="data.guard" class="node-badges">
      <span v-if="data.guard" class="badge guard-badge" title="guard condition">🛡️ guard</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    label: string
    nodeType?: string
    operation?: string
    functionRef?: string
    inputs?: Array<{ name: string; type?: string; required?: boolean }>
    outputs?: Array<{ name: string; type?: string }>
    guard?: string
  }
  selected?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.ewo-ac-node {
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  min-width: 180px;
  max-width: 260px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ewo-ac-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ewo-ac-node.selected {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.node-header {
  padding: 6px 10px;
  background: #eff6ff;
  border-bottom: 1px solid #bfdbfe;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-icon {
  font-size: 13px;
}

.node-label {
  font-weight: 700;
  color: #1e40af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-section {
  padding: 4px 0;
}

.section-label {
  padding: 2px 10px;
  font-size: 9px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.param-row {
  display: flex;
  align-items: center;
  padding: 2px 10px;
  position: relative;
}

.output-row {
  justify-content: flex-end;
}

.param-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.param-info.text-right {
  flex-direction: row-reverse;
  gap: 4px;
}

.param-name {
  font-weight: 500;
  color: #374151;
}

.param-type {
  color: #9ca3af;
  font-size: 9px;
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
  background: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.input-handle.required {
  background: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

.output-handle {
  background: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}

.node-badges {
  padding: 4px 10px 6px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  border-top: 1px solid #e5e7eb;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
}

.guard-badge {
  background: #fef3c7;
  color: #92400e;
}

</style>
