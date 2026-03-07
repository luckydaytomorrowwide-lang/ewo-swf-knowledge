import type { Node, Edge } from '@vue-flow/core'
import type { EwoLayout } from './types'

export function extractLayout(
  nodes: Node[],
  edges: Edge[],
  viewport: { x: number; y: number; zoom: number },
): EwoLayout {
  return {
    viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
    nodes: nodes.map(n => {
      const layoutNode: any = {
        id: n.id,
        type: n.type || 'ewoAc',
        position: { x: n.position.x, y: n.position.y },
        data: n.data,
      }
      if (n.style && typeof n.style === 'object' && Object.keys(n.style).length > 0) {
        layoutNode.style = n.style
      }
      if (n.parentNode) {
        layoutNode.parentNode = n.parentNode
      }
      if (n.extent) {
        layoutNode.extent = n.extent
      }
      return layoutNode
    }),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      targetHandle: e.targetHandle ?? undefined,
    })),
  }
}
