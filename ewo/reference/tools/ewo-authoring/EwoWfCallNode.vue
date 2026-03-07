<template>
  <div
    class="ewo-wfcall-node"
    :class="{ selected }"
  >
    <div class="node-header">
      <span class="node-icon">📡</span>
      <span class="node-label">{{ data.label }}</span>
      <span v-if="data.wfCall?.recursive" class="boundary-badge recursive-badge">🔄</span>
      <span v-if="data.wfCall?.boundary" class="boundary-badge">ext</span>
      <span v-else class="boundary-badge inline-badge">inline</span>
    </div>

    <div class="callee-info">
      <span class="callee-label">callee:</span>
      <span class="callee-name">{{ data.wfCall?.callee || '(未設定)' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    label: string
    inputs?: Array<{ name: string; type?: string }>
    outputs?: Array<{ name: string; type?: string }>
    wfCall?: {
      callee: string
      calleeVersion?: string
      boundary: boolean
      recursive?: boolean
      policy?: {
        timeoutSec?: number
        maxRecursionDepth?: number
        retry?: { max: number; backoffSec: number }
      }
    }
  }
  selected?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.ewo-wfcall-node {
  background: white;
  border: 2px solid #8b5cf6;
  border-radius: 8px;
  min-width: 180px;
  max-width: 260px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ewo-wfcall-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ewo-wfcall-node.selected {
  border-color: #6d28d9;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
}

.node-header {
  padding: 6px 10px;
  background: #f5f3ff;
  border-bottom: 1px solid #ddd6fe;
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
  color: #5b21b6;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.boundary-badge {
  font-size: 8px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: #fde68a;
  color: #92400e;
  text-transform: uppercase;
}

.inline-badge {
  background: #d1fae5;
  color: #065f46;
}

.recursive-badge {
  background: #fce7f3;
  color: #9d174d;
  font-size: 10px;
  padding: 0 3px;
}

.callee-info {
  padding: 4px 10px;
  font-size: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.callee-label {
  color: #9ca3af;
}

.callee-name {
  color: #5b21b6;
  font-weight: 600;
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
  background: #8b5cf6;
  box-shadow: 0 0 0 1px #8b5cf6;
}

.output-handle {
  background: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}
</style>
