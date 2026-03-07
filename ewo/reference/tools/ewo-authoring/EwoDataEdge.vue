<template>
  <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" />
  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        pointerEvents: 'all',
      }"
      class="edge-label"
    >
      <div class="edge-label-content">
        <span class="param-name">{{ data?.sourceParam || '' }}</span>
        <span class="arrow">→</span>
        <span class="param-name">{{ data?.targetParam || '' }}</span>
      </div>
      <div v-if="data?.dataType" class="data-type">{{ data.dataType }}</div>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'

defineOptions({ inheritAttrs: false })

interface Props {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: any
  targetPosition: any
  data?: {
    sourceParam?: string
    targetParam?: string
    dataType?: string
  }
  markerEnd?: string
  style?: any
}

const props = defineProps<Props>()

const path = computed(() => {
  return getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  })
})
</script>

<style scoped>
.edge-label {
  background: white;
  padding: 3px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.edge-label:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.edge-label-content {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.param-name {
  color: #374151;
}

.arrow {
  color: #9ca3af;
  font-weight: bold;
}

.data-type {
  font-size: 8px;
  color: #6b7280;
  text-align: center;
  margin-top: 1px;
  background: #f3f4f6;
  padding: 0 3px;
  border-radius: 2px;
}
</style>
