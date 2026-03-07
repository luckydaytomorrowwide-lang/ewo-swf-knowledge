import type { Node, Edge } from '@vue-flow/core'
import type { WfDef, WfNode, WfDepType, ForEachZone } from './types'

export function extractWfDef(nodes: Node[], edges: Edge[]): WfDef {
  const startNode = nodes.find(n => n.type === 'ewoStart')
  const endNode = nodes.find(n => n.type === 'ewoEnd')
  const regionNodes = nodes.filter(n => n.type === 'ewoForEachRegion')

  const inputs: Record<string, { schema: string }> = {}
  if (startNode?.data?.inputs) {
    for (const inp of startNode.data.inputs) {
      inputs[inp.name] = { schema: inp.type || 'any' }
    }
  }

  const outputs: Record<string, string> = {}
  if (endNode) {
    const incomingToEnd = edges.filter(e => e.target === endNode.id)
    for (const edge of incomingToEnd) {
      const targetHandle = edge.targetHandle?.replace(/^input-/, '') ?? ''
      const sourceNode = nodes.find(n => n.id === edge.source)
      const sourceHandle = edge.sourceHandle?.replace(/^output-/, '') ?? ''
      if (targetHandle && sourceNode) {
        const sourceAcId = resolveAcId(sourceNode)
        outputs[targetHandle] = `${sourceAcId}.${sourceHandle}`
      }
    }
  }

  // Build region membership map: childNodeId → immediate parent regionNode
  const regionSet = new Set(regionNodes.map(r => r.id))
  const childToRegion = new Map<string, Node>()
  for (const n of nodes) {
    if (n.parentNode && regionSet.has(n.parentNode)) {
      const region = regionNodes.find(r => r.id === n.parentNode)
      if (region) childToRegion.set(n.id, region)
    }
  }

  const wfNodes: WfNode[] = []
  const acNodes = nodes.filter(n => n.type === 'ewoAc' || n.type === 'ewoWfCall')

  for (const node of acNodes) {
    const acId = node.data?.label || node.id
    const deps: Record<string, WfDepType> = {}
    const region = childToRegion.get(node.id)

    const incomingEdges = edges.filter(e => e.target === node.id)
    for (const edge of incomingEdges) {
      const targetPort = edge.targetHandle?.replace(/^input-/, '') ?? ''
      const sourceNode = nodes.find(n => n.id === edge.source)
      if (!sourceNode || !targetPort) continue

      if (sourceNode.type === 'ewoLiteral') {
        deps[targetPort] = { literal: resolveLiteralValue(sourceNode.data) }
      } else if (sourceNode.type === 'ewoStart') {
        const sourcePort = edge.sourceHandle?.replace(/^output-/, '') ?? ''
        deps[targetPort] = { sourceAcId: '$input', sourcePort }
      } else {
        const sourcePort = edge.sourceHandle?.replace(/^output-/, '') ?? ''
        const sourceAcId = resolveAcId(sourceNode)
        deps[targetPort] = { sourceAcId, sourcePort }
      }
    }

    // Zone entry node: edges from region's iter-out → $zoneInput dep
    if (region) {
      const regionEdges = edges.filter(e => e.source === region.id && e.target === node.id)
      for (const edge of regionEdges) {
        const targetPort = edge.targetHandle?.replace(/^input-/, '') ?? ''
        if (targetPort && edge.sourceHandle === 'iter-out') {
          const iterParam = region.data?.iterationParam || 'item'
          deps[targetPort] = { sourceAcId: '$zoneInput', sourcePort: iterParam }
        }
      }
    }

    const outputsDef: Record<string, Record<string, never>> = {}
    if (node.data?.outputs) {
      for (const out of node.data.outputs) {
        outputsDef[out.name] = {}
      }
    }

    const wfNode: WfNode = {
      id: acId,
      operation: node.data?.operation || node.data?.functionRef || '',
      deps,
      outputs: outputsDef,
    }

    if (node.data?.guard) {
      wfNode.guard = node.data.guard
    }

    if (node.type === 'ewoWfCall' && node.data?.wfCall) {
      wfNode.wfCall = {
        callee: node.data.wfCall.callee,
        calleeVersion: node.data.wfCall.calleeVersion,
        boundary: node.data.wfCall.boundary ?? false,
      }
      if (node.data.wfCall.recursive) {
        wfNode.wfCall.recursive = true
      }
      if (node.data.wfCall.policy) {
        wfNode.wfCall.policy = { ...node.data.wfCall.policy }
      }
    }

    wfNodes.push(wfNode)
  }

  // Build ForEachZones from region nodes (supporting nesting)
  const topLevelRegions = regionNodes.filter(r => !regionSet.has(r.parentNode ?? ''))

  function buildZone(region: Node): ForEachZone {
    const zoneId = region.data?.zoneId || region.data?.label || region.id

    // Direct child AC/wfCall nodes (not in sub-regions)
    const childNodeIds = nodes
      .filter(n => n.parentNode === region.id && (n.type === 'ewoAc' || n.type === 'ewoWfCall'))
      .map(n => n.data?.label || n.id)

    // Child regions (nested ForEach)
    const childRegions = regionNodes.filter(r => r.parentNode === region.id)
    const childZones = childRegions.map(cr => buildZone(cr))

    const incomingToRegion = edges.filter(e => e.target === region.id && e.targetHandle === 'input-collection')
    let collectionSource = { sourceAcId: '$input', sourcePort: 'items' }
    if (incomingToRegion.length > 0) {
      const srcNode = nodes.find(n => n.id === incomingToRegion[0].source)
      const srcPort = incomingToRegion[0].sourceHandle?.replace(/^output-/, '') ?? ''
      if (srcNode) {
        const srcAcId = srcNode.type === 'ewoStart' ? '$input' : resolveAcId(srcNode)
        collectionSource = { sourceAcId: srcAcId, sourcePort: srcPort }
      }
    }

    const collectEdges = edges.filter(e => e.target === region.id && e.targetHandle === 'collect-in')
    let outputNodeId = ''
    let outputPort = ''

    if (collectEdges.length > 0) {
      const collectEdge = collectEdges[0]
      const outSrcNode = nodes.find(n => n.id === collectEdge.source)
      if (outSrcNode) {
        outputNodeId = resolveAcId(outSrcNode)
        outputPort = collectEdge.sourceHandle?.replace(/^output-/, '') ?? ''
      }
    } else if (region.data?.outputNodeId) {
      outputNodeId = region.data.outputNodeId
      outputPort = region.data.outputPort || ''
    } else {
      outputNodeId = childNodeIds[childNodeIds.length - 1] ?? ''
      const outNode = wfNodes.find(n => n.id === outputNodeId)
      if (outNode && Object.keys(outNode.outputs).length > 0) {
        outputPort = Object.keys(outNode.outputs)[0]
      }
    }

    const zone: ForEachZone = {
      id: zoneId,
      collectionSource,
      iterationParam: region.data?.iterationParam || 'item',
      nodes: childNodeIds,
      outputNodeId,
      outputPort,
      outputCollection: region.data?.outputCollection || `${zoneId}Results`,
      mode: region.data?.mode || 'parallel',
    }

    if (childZones.length > 0) {
      zone.childZones = childZones
    }

    return zone
  }

  const forEachZones = topLevelRegions.map(r => buildZone(r))

  // For downstream nodes that depend on zone output, convert their deps to $zone: reference
  function resolveZoneOutputDeps(zones: ForEachZone[]): void {
    for (const zone of zones) {
      const regionNode = regionNodes.find(r => (r.data?.zoneId || r.data?.label || r.id) === zone.id)
      if (!regionNode) continue

      const outgoingEdges = edges.filter(e => e.source === regionNode.id && e.sourceHandle === 'output-results')
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target)
        if (!targetNode) continue
        const targetAcId = resolveAcId(targetNode)
        const targetPort = edge.targetHandle?.replace(/^input-/, '') ?? ''
        const wfNode = wfNodes.find(n => n.id === targetAcId)
        if (wfNode && targetPort) {
          wfNode.deps[targetPort] = { sourceAcId: `$zone:${zone.id}`, sourcePort: zone.outputCollection }
        }
      }

      if (zone.childZones) {
        resolveZoneOutputDeps(zone.childZones)
      }
    }
  }
  resolveZoneOutputDeps(forEachZones)

  const result: WfDef = { nodes: wfNodes, inputs, outputs }
  if (forEachZones.length > 0) {
    result.forEachZones = forEachZones
  }
  return result
}

function resolveAcId(node: Node): string {
  return node.data?.label || node.id
}

function resolveLiteralValue(data: any): any {
  const value = data?.value
  const valueType = data?.valueType || 'string'

  switch (valueType) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === true || value === 'true'
    case 'object':
      try { return JSON.parse(value) } catch { return value }
    default:
      return value
  }
}
