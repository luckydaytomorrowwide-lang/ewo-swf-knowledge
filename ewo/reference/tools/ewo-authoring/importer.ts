import type { Node, Edge } from '@vue-flow/core'
import type { EwoJson, WfNode, ForEachZone } from './types'
import { isWfDep, isWfDepLiteral } from './types'
import dagre from 'dagre'

export interface ImportResult {
  nodes: Node[]
  edges: Edge[]
  viewport: { x: number; y: number; zoom: number }
  meta: {
    id: string
    version: string
    name: string
    description?: string
  }
}

export function importEwoJson(json: EwoJson): ImportResult {
  const meta = {
    id: json.id,
    version: json.version,
    name: json.name,
    description: json.description,
  }

  if (json.layout?.nodes?.length > 0) {
    return restoreFromLayout(json, meta)
  }

  return generateAutoLayout(json, meta)
}

function restoreFromLayout(
  json: EwoJson,
  meta: ImportResult['meta'],
): ImportResult {
  const layout = json.layout

  const nodes: Node[] = layout.nodes.map(ln => {
    const n: Node = {
      id: ln.id,
      type: ln.type,
      position: { x: ln.position.x, y: ln.position.y },
      data: ln.data || {},
    }
    if (ln.style) {
      n.style = ln.style
    }
    if (ln.parentNode) {
      n.parentNode = ln.parentNode
    }
    if (ln.extent) {
      n.extent = ln.extent
    }
    return n
  })

  const edges: Edge[] = layout.edges.map(le => ({
    id: le.id,
    source: le.source,
    target: le.target,
    sourceHandle: le.sourceHandle,
    targetHandle: le.targetHandle,
    type: 'ewoDataEdge',
    data: buildEdgeData(le.sourceHandle, le.targetHandle),
  }))

  supplementZoneInternalEdges(json, nodes, edges)

  return {
    nodes,
    edges,
    viewport: layout.viewport || { x: 0, y: 0, zoom: 0.8 },
    meta,
  }
}

function generateAutoLayout(
  json: EwoJson,
  meta: ImportResult['meta'],
): ImportResult {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let edgeIdx = 0

  const zones = json.wfDef.forEachZones ?? []
  const allZones = flattenAllZones(zones)
  const zoneNodeSet = new Set(allZones.flatMap(z => z.nodes))
  const zoneByNodeId = new Map<string, ForEachZone>()
  for (const z of allZones) {
    for (const nid of z.nodes) zoneByNodeId.set(nid, z)
  }
  const childZoneParent = new Map<string, string>()
  buildChildZoneParentMap(zones, childZoneParent)

  const startNodeId = 'node-start'
  nodes.push({
    id: startNodeId,
    type: 'ewoStart',
    position: { x: 0, y: 0 },
    data: {
      inputs: Object.entries(json.inputs || {}).map(([name, def]) => ({
        name,
        type: def.schema,
      })),
    },
  })

  const nodeIdMap = new Map<string, string>()
  const regionNodeIdMap = new Map<string, string>()

  // Create region nodes for all zones (including nested)
  for (const zone of allZones) {
    const regionId = `node-${zone.id}`
    regionNodeIdMap.set(zone.id, regionId)
    const n: Node = {
      id: regionId,
      type: 'ewoForEachRegion',
      position: { x: 0, y: 0 },
      style: { width: zone.childZones?.length ? '700px' : '520px', height: zone.childZones?.length ? '350px' : '300px' },
      data: {
        label: `ForEach Zone: ${zone.id}`,
        zoneId: zone.id,
        iterationParam: zone.iterationParam,
        outputCollection: zone.outputCollection,
        mode: zone.mode || 'parallel',
      },
    }

    const parentZoneId = childZoneParent.get(zone.id)
    if (parentZoneId) {
      const parentRegionId = `node-${parentZoneId}`
      n.parentNode = parentRegionId
      n.extent = 'parent'
    }

    nodes.push(n)
  }

  for (const wfNode of json.wfDef.nodes) {
    const vfId = `node-${wfNode.id}`
    nodeIdMap.set(wfNode.id, vfId)

    const nodeType = wfNode.wfCall ? 'ewoWfCall' : 'ewoAc'
    const zone = zoneByNodeId.get(wfNode.id)

    const n: Node = {
      id: vfId,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: buildNodeData(wfNode),
    }

    if (zone) {
      const regionId = regionNodeIdMap.get(zone.id)
      if (regionId) {
        n.parentNode = regionId
        n.extent = 'parent'
      }
    }

    nodes.push(n)
  }

  const endNodeId = 'node-end'
  nodes.push({
    id: endNodeId,
    type: 'ewoEnd',
    position: { x: 0, y: 0 },
    data: {
      outputs: Object.keys(json.wfDef.outputs || {}).map(name => ({ name })),
    },
  })

  for (const wfNode of json.wfDef.nodes) {
    const targetVfId = nodeIdMap.get(wfNode.id)!
    const zone = zoneByNodeId.get(wfNode.id)

    for (const [portName, dep] of Object.entries(wfNode.deps)) {
      if (isWfDep(dep)) {
        if (dep.sourceAcId === '$zoneInput') {
          // Zone iter-out → entry AC input
          if (zone) {
            const regionVfId = regionNodeIdMap.get(zone.id)
            if (regionVfId) {
              edges.push({
                id: `e-${edgeIdx++}`,
                source: regionVfId,
                target: targetVfId,
                sourceHandle: 'iter-out',
                targetHandle: `input-${portName}`,
                type: 'ewoDataEdge',
                data: buildEdgeData('iter-out', `input-${portName}`),
              })
            }
          }
          continue
        }
        if (dep.sourceAcId.startsWith('$zone:')) {
          const zoneId = dep.sourceAcId.slice(6)
          const regionVfId = regionNodeIdMap.get(zoneId)
          if (regionVfId) {
            edges.push({
              id: `e-${edgeIdx++}`,
              source: regionVfId,
              target: targetVfId,
              sourceHandle: 'output-results',
              targetHandle: `input-${portName}`,
              type: 'ewoDataEdge',
              data: buildEdgeData('output-results', `input-${portName}`),
            })
          }
          continue
        }

        const sourceVfId = dep.sourceAcId === '$input'
          ? startNodeId
          : nodeIdMap.get(dep.sourceAcId)
        if (!sourceVfId) continue

        const sourceHandle = `output-${dep.sourcePort}`

        edges.push({
          id: `e-${edgeIdx++}`,
          source: sourceVfId,
          target: targetVfId,
          sourceHandle,
          targetHandle: `input-${portName}`,
          type: 'ewoDataEdge',
          data: buildEdgeData(sourceHandle, `input-${portName}`),
        })
      } else if (isWfDepLiteral(dep)) {
        const litId = `node-lit-${wfNode.id}-${portName}`
        nodes.push({
          id: litId,
          type: 'ewoLiteral',
          position: { x: 0, y: 0 },
          data: {
            value: dep.literal,
            valueType: typeof dep.literal,
          },
        })
        edges.push({
          id: `e-${edgeIdx++}`,
          source: litId,
          target: targetVfId,
          sourceHandle: 'output',
          targetHandle: `input-${portName}`,
          type: 'ewoDataEdge',
          data: buildEdgeData('output', `input-${portName}`),
        })
      }
    }
  }

  // Zone collection source edges + output node → collect-in edges
  for (const zone of allZones) {
    const regionVfId = regionNodeIdMap.get(zone.id)
    if (!regionVfId) continue

    // External: upstream AC → zone input-collection
    const srcAcId = zone.collectionSource.sourceAcId
    const srcVfId = srcAcId === '$input' ? startNodeId : nodeIdMap.get(srcAcId)
    if (srcVfId) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: srcVfId,
        target: regionVfId,
        sourceHandle: `output-${zone.collectionSource.sourcePort}`,
        targetHandle: 'input-collection',
        type: 'ewoDataEdge',
        data: buildEdgeData(`output-${zone.collectionSource.sourcePort}`, 'input-collection'),
      })
    }

    // Internal: output node → zone collect-in
    if (zone.outputNodeId && zone.outputPort) {
      const outVfId = nodeIdMap.get(zone.outputNodeId)
      if (outVfId) {
        edges.push({
          id: `e-${edgeIdx++}`,
          source: outVfId,
          target: regionVfId,
          sourceHandle: `output-${zone.outputPort}`,
          targetHandle: 'collect-in',
          type: 'ewoDataEdge',
          data: buildEdgeData(`output-${zone.outputPort}`, 'collect-in'),
        })
      }
    }
  }

  for (const [outputName, sourceRef] of Object.entries(json.wfDef.outputs || {})) {
    const [acId, portName] = sourceRef.split('.')
    const sourceVfId = nodeIdMap.get(acId)
    if (sourceVfId) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: sourceVfId,
        target: endNodeId,
        sourceHandle: `output-${portName}`,
        targetHandle: `input-${outputName}`,
        type: 'ewoDataEdge',
        data: buildEdgeData(`output-${portName}`, `input-${outputName}`),
      })
    }
  }

  applyDagreLayout(nodes, edges)

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 0.8 },
    meta,
  }
}

/**
 * Supplement missing zone internal edges based on forEachZones definition.
 * Used by restoreFromLayout to fill in iter-out/collect-in edges
 * when loading older JSON that lacks them.
 */
function supplementZoneInternalEdges(json: EwoJson, nodes: Node[], edges: Edge[]): void {
  const zones = json.wfDef.forEachZones ?? []
  if (zones.length === 0) return

  let edgeIdx = edges.length + 100
  const allZones = flattenAllZones(zones)

  for (const zone of allZones) {
    const regionNode = nodes.find(n => n.type === 'ewoForEachRegion' && n.data?.zoneId === zone.id)
    if (!regionNode) continue

    // Check iter-out edge: region → entry node
    const hasIterOut = edges.some(e => e.source === regionNode.id && e.sourceHandle === 'iter-out')
    if (!hasIterOut) {
      for (const wfNode of json.wfDef.nodes) {
        if (!zone.nodes.includes(wfNode.id)) continue
        for (const [depKey, dep] of Object.entries(wfNode.deps)) {
          if (isWfDep(dep) && dep.sourceAcId === '$zoneInput') {
            const targetVfNode = nodes.find(n =>
              n.data?.label === wfNode.id || n.id === `node-${wfNode.id}`
            )
            if (targetVfNode) {
              edges.push({
                id: `e-zone-iter-${edgeIdx++}`,
                source: regionNode.id,
                target: targetVfNode.id,
                sourceHandle: 'iter-out',
                targetHandle: `input-${depKey}`,
                type: 'ewoDataEdge',
                data: buildEdgeData('iter-out', `input-${depKey}`),
              })
            }
          }
        }
      }
    }

    // Check collect-in edge: output node → region
    const hasCollectIn = edges.some(e => e.target === regionNode.id && e.targetHandle === 'collect-in')
    if (!hasCollectIn && zone.outputNodeId && zone.outputPort) {
      const outVfNode = nodes.find(n =>
        n.data?.label === zone.outputNodeId || n.id === `node-${zone.outputNodeId}`
      )
      if (outVfNode) {
        edges.push({
          id: `e-zone-collect-${edgeIdx++}`,
          source: outVfNode.id,
          target: regionNode.id,
          sourceHandle: `output-${zone.outputPort}`,
          targetHandle: 'collect-in',
          type: 'ewoDataEdge',
          data: buildEdgeData(`output-${zone.outputPort}`, 'collect-in'),
        })
      }
    }
  }
}

function buildNodeData(wfNode: WfNode): Record<string, any> {
  const data: Record<string, any> = {
    label: wfNode.id,
    operation: wfNode.operation,
    functionRef: wfNode.operation,
    inputs: Object.keys(wfNode.deps).map(name => ({ name })),
    outputs: Object.keys(wfNode.outputs).map(name => ({ name })),
  }

  if (wfNode.guard) data.guard = wfNode.guard
  if (wfNode.wfCall) data.wfCall = { ...wfNode.wfCall }

  return data
}

function buildEdgeData(sourceHandle?: string | null, targetHandle?: string | null) {
  return {
    sourceParam: sourceHandle?.replace(/^output-/, '') || '',
    targetParam: targetHandle?.replace(/^input-/, '') || '',
  }
}

function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 60 })

  // Exclude child nodes from dagre (they are positioned within their parent)
  const childNodeIds = new Set(nodes.filter(n => n.parentNode).map(n => n.id))

  for (const node of nodes) {
    if (childNodeIds.has(node.id)) continue
    const w = node.type === 'ewoLiteral' ? 120
            : node.type === 'ewoForEachRegion' ? 520
            : 200
    const h = node.type === 'ewoLiteral' ? 60
            : node.type === 'ewoForEachRegion' ? 300
            : 120
    g.setNode(node.id, { width: w, height: h })
  }

  for (const edge of edges) {
    if (childNodeIds.has(edge.source) || childNodeIds.has(edge.target)) continue
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  for (const node of nodes) {
    if (childNodeIds.has(node.id)) continue
    const pos = g.node(node.id)
    if (pos) {
      node.position = {
        x: pos.x - (pos.width ?? 200) / 2,
        y: pos.y - (pos.height ?? 120) / 2,
      }
    }
  }

  // Position child nodes within their region
  const regionChildren = new Map<string, Node[]>()
  for (const node of nodes) {
    if (node.parentNode) {
      if (!regionChildren.has(node.parentNode)) {
        regionChildren.set(node.parentNode, [])
      }
      regionChildren.get(node.parentNode)!.push(node)
    }
  }

  for (const [, children] of regionChildren) {
    let x = 40
    for (const child of children) {
      const isRegion = child.type === 'ewoForEachRegion'
      child.position = { x, y: isRegion ? 50 : 60 }
      x += isRegion ? 320 : 250
    }
  }
}

function flattenAllZones(zones: ForEachZone[]): ForEachZone[] {
  const result: ForEachZone[] = []
  for (const z of zones) {
    result.push(z)
    if (z.childZones) {
      result.push(...flattenAllZones(z.childZones))
    }
  }
  return result
}

function buildChildZoneParentMap(zones: ForEachZone[], map: Map<string, string>): void {
  for (const z of zones) {
    if (z.childZones) {
      for (const child of z.childZones) {
        map.set(child.id, z.id)
        buildChildZoneParentMap([child], map)
      }
    }
  }
}
