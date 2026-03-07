import type { Node, Edge } from '@vue-flow/core'

export interface ValidationError {
  severity: 'error' | 'warning' | 'info'
  category: 'structure' | 'dag' | 'port' | 'guard' | 'forEach' | 'forEachZone' | 'wfCall'
  message: string
  nodeId?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
}

export function validateEwoWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const info: ValidationError[] = []

  validateStructure(nodes, errors, warnings)
  validateDag(nodes, edges, errors)
  validatePorts(nodes, edges, errors, warnings)
  validateGuard(nodes, warnings)
  validateForEach(nodes, edges, errors)
  validateWfCall(nodes, errors)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  }
}

function validateStructure(nodes: Node[], errors: ValidationError[], warnings: ValidationError[]) {
  const startNodes = nodes.filter(n => n.type === 'ewoStart')
  const endNodes = nodes.filter(n => n.type === 'ewoEnd')

  if (startNodes.length === 0) {
    errors.push({ severity: 'error', category: 'structure', message: 'Workflow Start ノードが必要です' })
  } else if (startNodes.length > 1) {
    errors.push({ severity: 'error', category: 'structure', message: 'Workflow Start ノードは1つだけ配置してください' })
  }

  if (endNodes.length === 0) {
    errors.push({ severity: 'error', category: 'structure', message: 'Workflow End ノードが必要です' })
  } else if (endNodes.length > 1) {
    errors.push({ severity: 'error', category: 'structure', message: 'Workflow End ノードは1つだけ配置してください' })
  }

  const acNodes = nodes.filter(n => n.type === 'ewoAc' || n.type === 'ewoWfCall')
  if (acNodes.length === 0) {
    warnings.push({ severity: 'warning', category: 'structure', message: 'Activity ノードがありません' })
  }

  for (const node of acNodes) {
    const nodeLabel = node.data?.label || node.id
    if (nodeLabel.includes('/')) {
      errors.push({
        severity: 'error',
        category: 'structure',
        message: `${nodeLabel}: ノード ID に "/" を含めることはできません（インライン展開時の名前空間セパレータと衝突）`,
        nodeId: node.id,
      })
    }
  }
}

function validateDag(nodes: Node[], edges: Edge[], errors: ValidationError[]) {
  const acNodes = nodes.filter(n => n.type === 'ewoAc' || n.type === 'ewoWfCall')
  const adj = new Map<string, string[]>()

  for (const n of acNodes) {
    adj.set(n.id, [])
  }

  for (const edge of edges) {
    const src = edge.source
    const tgt = edge.target
    const srcNode = nodes.find(n => n.id === src)
    const tgtNode = nodes.find(n => n.id === tgt)
    if (srcNode && tgtNode &&
        (srcNode.type === 'ewoAc' || srcNode.type === 'ewoWfCall') &&
        (tgtNode.type === 'ewoAc' || tgtNode.type === 'ewoWfCall')) {
      adj.get(src)?.push(tgt)
    }
  }

  const visited = new Set<string>()
  const inStack = new Set<string>()

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId)
    inStack.add(nodeId)
    for (const next of adj.get(nodeId) || []) {
      if (!visited.has(next)) {
        if (hasCycle(next)) return true
      } else if (inStack.has(next)) {
        return true
      }
    }
    inStack.delete(nodeId)
    return false
  }

  for (const nodeId of adj.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) {
        errors.push({ severity: 'error', category: 'dag', message: '依存グラフに循環が検出されました。DAGである必要があります' })
        return
      }
    }
  }
}

function validatePorts(nodes: Node[], edges: Edge[], errors: ValidationError[], warnings: ValidationError[]) {
  const acNodes = nodes.filter(n => n.type === 'ewoAc' || n.type === 'ewoWfCall')

  for (const node of acNodes) {
    const incoming = edges.filter(e => e.target === node.id)
    const connectedPorts = new Set(incoming.map(e => e.targetHandle?.replace(/^input-/, '')))

    if (node.data?.inputs) {
      for (const inp of node.data.inputs) {
        if (inp.required && !connectedPorts.has(inp.name)) {
          const litConnected = incoming.some(e => {
            const src = nodes.find(n => n.id === e.source)
            return src?.type === 'ewoLiteral' && e.targetHandle === `input-${inp.name}`
          })
          if (!litConnected) {
            warnings.push({
              severity: 'warning',
              category: 'port',
              message: `${node.data.label || node.id}: 入力ポート "${inp.name}" が未接続です`,
              nodeId: node.id,
            })
          }
        }
      }
    }

    if (incoming.length === 0) {
      const startEdges = edges.filter(e => e.target === node.id && nodes.find(n => n.id === e.source)?.type === 'ewoStart')
      if (startEdges.length === 0) {
        warnings.push({
          severity: 'warning',
          category: 'port',
          message: `${node.data?.label || node.id}: 孤立ノードです（入力エッジがありません）`,
          nodeId: node.id,
        })
      }
    }
  }

  const endNode = nodes.find(n => n.type === 'ewoEnd')
  if (endNode) {
    const endIncoming = edges.filter(e => e.target === endNode.id)
    if (endIncoming.length === 0) {
      warnings.push({ severity: 'warning', category: 'port', message: 'Workflow End に接続されたエッジがありません' })
    }
  }
}

function validateGuard(nodes: Node[], warnings: ValidationError[]) {
  for (const node of nodes) {
    if (node.data?.guard) {
      const g = node.data.guard.trim()
      if (!g.startsWith('.')) {
        warnings.push({
          severity: 'warning',
          category: 'guard',
          message: `${node.data.label || node.id}: guard 式は "." で始まるJQ式を推奨します`,
          nodeId: node.id,
        })
      }
    }
  }
}

function validateForEach(nodes: Node[], edges: Edge[], errors: ValidationError[]) {
  const regionNodes = nodes.filter(n => n.type === 'ewoForEachRegion')
  for (const region of regionNodes) {
    const label = region.data?.label || region.id

    if (!region.data?.zoneId) {
      errors.push({
        severity: 'error',
        category: 'forEachZone',
        message: `${label}: Zone ID が未設定です`,
        nodeId: region.id,
      })
    }
    if (!region.data?.iterationParam) {
      errors.push({
        severity: 'error',
        category: 'forEachZone',
        message: `${label}: iterationParam が未設定です`,
        nodeId: region.id,
      })
    }

    const children = nodes.filter(n => n.parentNode === region.id)
    if (children.length === 0) {
      errors.push({
        severity: 'error',
        category: 'forEachZone',
        message: `${label}: ゾーン内にノードがありません`,
        nodeId: region.id,
      })
    }

    const hasInputCollection = edges.some(
      e => e.target === region.id && e.targetHandle === 'input-collection'
    )
    if (!hasInputCollection) {
      errors.push({
        severity: 'error',
        category: 'forEachZone',
        message: `${label}: input-collection が未接続です（コレクションソースが必要）`,
        nodeId: region.id,
      })
    }

    const hasIterOut = edges.some(
      e => e.source === region.id && e.sourceHandle === 'iter-out'
    )
    if (!hasIterOut && children.length > 0) {
      errors.push({
        severity: 'warning',
        category: 'forEachZone',
        message: `${label}: iter-out が未接続です（ゾーン先頭ACへの結線が必要）`,
        nodeId: region.id,
      })
    }

    const hasCollectIn = edges.some(
      e => e.target === region.id && e.targetHandle === 'collect-in'
    )
    if (!hasCollectIn && children.length > 0) {
      errors.push({
        severity: 'warning',
        category: 'forEachZone',
        message: `${label}: collect-in が未接続です（ゾーン末尾ACからの結線が必要）`,
        nodeId: region.id,
      })
    }

    const hasOutputResults = edges.some(
      e => e.source === region.id && e.sourceHandle === 'output-results'
    )
    if (!hasOutputResults) {
      errors.push({
        severity: 'warning',
        category: 'forEachZone',
        message: `${label}: output-results が未接続です（下流ノードへの結線が必要）`,
        nodeId: region.id,
      })
    }
  }
}

function validateWfCall(nodes: Node[], errors: ValidationError[]) {
  for (const node of nodes) {
    if (node.type === 'ewoWfCall') {
      const label = node.data?.label || node.id

      if (!node.data?.wfCall?.callee) {
        errors.push({
          severity: 'error',
          category: 'wfCall',
          message: `${label}: wfCall の callee が未設定です`,
          nodeId: node.id,
        })
      }

      if (node.data?.wfCall?.boundary === true && !node.data?.wfCall?.policy) {
        errors.push({
          severity: 'warning',
          category: 'wfCall',
          message: `${label}: boundary=true の wfCall に policy（timeout/retry）が未設定です`,
          nodeId: node.id,
        })
      }

      if (node.data?.wfCall?.recursive === true && node.data?.wfCall?.boundary === false) {
        errors.push({
          severity: 'error',
          category: 'wfCall',
          message: `${label}: recursive=true は boundary=true の場合のみ許可されます`,
          nodeId: node.id,
        })
      }

      if (node.id.includes('/')) {
        errors.push({
          severity: 'error',
          category: 'wfCall',
          message: `${label}: ノード ID に "/" を含めることはできません（インライン展開時の名前空間セパレータと衝突）`,
          nodeId: node.id,
        })
      }
    }
  }
}
