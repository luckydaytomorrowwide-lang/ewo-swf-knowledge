<template>
  <div 
    class="foreach-region"
    :class="{ 'selected': selected }"
  >
    <div class="region-header">
      <div class="header-left">
        <span class="region-icon">&#x1f501;</span>
        <span class="region-title">ForEach</span>
        <span v-if="data.label" class="region-label">: {{ data.label }}</span>
      </div>
    </div>

    <div class="region-config">
      <div class="config-item">
        <span class="config-label iter-label">ITER:</span>
        <code class="config-value">{{ data.iterationParam || 'item' }}</code>
      </div>
      <div v-if="data.outputCollection" class="config-item out-config-item">
        <span class="config-label out-label">OUT:</span>
        <code class="config-value">{{ data.outputCollection }}</code>
      </div>
    </div>

    <!-- External handles -->
    <Handle
      id="input-collection"
      type="target"
      :position="Position.Left"
      class="region-handle input-handle"
    />
    <Handle
      id="output-results"
      type="source"
      :position="Position.Right"
      class="region-handle output-handle"
    />

    <!-- Internal handles -->
    <Handle
      id="iter-out"
      type="source"
      :position="Position.Right"
      class="region-handle iter-handle"
      :style="{ top: '72px', left: '24px', right: 'auto' }"
    />
    <Handle
      id="collect-in"
      type="target"
      :position="Position.Left"
      class="region-handle collect-handle"
      :style="{ top: '72px', right: '24px', left: 'auto' }"
    />

    <div
      class="resize-handle"
      @pointerdown.stop="onResizeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, useNode, useVueFlow } from '@vue-flow/core'

interface Props {
  data: {
    label?: string
    zoneId?: string
    iterationParam?: string
    outputCollection?: string
  }
  selected?: boolean
}

defineProps<Props>()

const { node } = useNode()
const { getViewport } = useVueFlow()

const resizing = ref(false)
const startX = ref(0)
const startY = ref(0)
const startW = ref(0)
const startH = ref(0)

function onResizeStart(e: PointerEvent) {
  e.preventDefault()
  resizing.value = true
  node.draggable = false
  startX.value = e.clientX
  startY.value = e.clientY
  startW.value = parseInt(node.style?.width as string) || node.dimensions?.width || 520
  startH.value = parseInt(node.style?.height as string) || node.dimensions?.height || 300
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  document.addEventListener('pointermove', onResizeMove)
  document.addEventListener('pointerup', onResizeEnd)
}

function onResizeMove(e: PointerEvent) {
  if (!resizing.value) return
  const zoom = getViewport().zoom || 1
  const dx = (e.clientX - startX.value) / zoom
  const dy = (e.clientY - startY.value) / zoom
  const newW = Math.max(400, startW.value + dx)
  const newH = Math.max(200, startH.value + dy)
  node.style = { ...node.style, width: `${newW}px`, height: `${newH}px` }
}

function onResizeEnd() {
  resizing.value = false
  node.draggable = true
  document.removeEventListener('pointermove', onResizeMove)
  document.removeEventListener('pointerup', onResizeEnd)
}
</script>

<style scoped>
.foreach-region {
  width: 100%;
  height: 100%;
  background: rgba(219, 234, 254, 0.15);
  border: 2px dashed #3b82f6;
  border-radius: 12px;
  font-size: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.foreach-region:hover {
  border-color: #2563eb;
}

.foreach-region.selected {
  border-color: #1d4ed8;
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.region-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: linear-gradient(to right, #dbeafe, #eff6ff);
  border-bottom: 1px solid #bfdbfe;
  border-radius: 10px 10px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.region-icon {
  font-size: 14px;
}

.region-title {
  font-weight: 700;
  color: #1e40af;
  font-size: 13px;
}

.region-label {
  font-weight: 500;
  color: #3b82f6;
  font-size: 12px;
}

.region-config {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid #e5e7eb;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.out-config-item {
  margin-left: auto;
  justify-content: flex-end;
}

.config-label {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.iter-label {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.14);
  border: 1px solid rgba(124, 58, 237, 0.28);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 700;
}

.out-label {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 700;
}

.config-value {
  font-size: 11px;
  color: #374151;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.region-handle {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  transition: all 0.2s;
}

.region-handle:hover {
  width: 14px;
  height: 14px;
}

.input-handle {
  background: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}

.output-handle {
  background: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.iter-handle {
  background: #7c3aed;
  box-shadow: 0 0 0 1px #7c3aed;
  width: 10px;
  height: 10px;
}

.collect-handle {
  background: #f59e0b;
  box-shadow: 0 0 0 1px #f59e0b;
  width: 10px;
  height: 10px;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  border-right: 3px solid #93c5fd;
  border-bottom: 3px solid #93c5fd;
  border-radius: 0 0 10px 0;
  transition: border-color 0.15s;
}

.resize-handle:hover {
  border-color: #3b82f6;
}
</style>
