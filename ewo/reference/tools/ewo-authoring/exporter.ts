import type { Node, Edge } from '@vue-flow/core'
import type { EwoJson } from './types'
import { extractWfDef } from './extractWfDef'
import { extractWiring } from './extractWiring'
import { extractLayout } from './extractLayout'

export interface ExportMetadata {
  id: string
  version: string
  name: string
  description?: string
}

export function exportEwoJson(
  nodes: Node[],
  edges: Edge[],
  viewport: { x: number; y: number; zoom: number },
  meta: ExportMetadata,
): EwoJson {
  const wfDef = extractWfDef(nodes, edges)
  const wiring = extractWiring(wfDef, meta.id)
  const layout = extractLayout(nodes, edges, viewport)

  return {
    id: meta.id,
    version: meta.version,
    name: meta.name,
    description: meta.description,
    inputs: wfDef.inputs,
    wfDef: {
      nodes: wfDef.nodes,
      ...(wfDef.forEachZones && wfDef.forEachZones.length > 0 ? { forEachZones: wfDef.forEachZones } : {}),
      outputs: wfDef.outputs,
    },
    wiring,
    layout,
  }
}
