import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BuildLayoutStructWF } from '../BuildLayoutStructWF'
import { setActivePinia, createPinia } from 'pinia'

// モック定義
vi.mock('../GetNodeTableWF', () => ({
  GetNodeTableWF: vi.fn(async ({ nodeId }) => ({
    firstBlockId: 'firstBlockId_' + nodeId,
    tableId: 'tableId_' + nodeId
  }))
}))

vi.mock('../DeployBlockWF', () => ({
  DeployBlockWF: vi.fn(async ({ tableId, lineId }) => ({
    tempTableId: tableId + '_deploy_' + lineId
  }))
}))

vi.mock('../BuildLayoutAnchorKeyWF', () => ({
  BuildLayoutAnchorKeyWF: vi.fn(async ({ blockKey }) => ({
    blockKey: 'block[' + blockKey + ']'
  }))
}))

vi.mock('../BuildLayoutBlockWF', () => ({
  BuildLayoutBlockWF: vi.fn(async () => ({
    success: true
  }))
}))

vi.mock('../../activities/CreateLayoutBlockPropertyAC', () => ({
  CreateLayoutBlockPropertyAC: vi.fn(async (payload) => ({
    property: { ...payload }
  }))
}))

vi.mock('../../activities/BuildLayoutBlockRowAC', () => ({
  BuildLayoutBlockRowAC: vi.fn(async (payload) => ({
    row: { [payload.key]: payload }
  }))
}))

describe('BuildLayoutStructWF', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('画像通りのフローで処理が実行され、正しい結果が返ること', async () => {
    const payload = {
      rows: [
        { nodeId: 'node01' }
      ]
    }

    const result = await BuildLayoutStructWF(payload)

    expect(result.layoutRows).toHaveLength(1)
    const row = result.layoutRows[0]
    const expectedKey = 'block[基本情報-rootId]'
    expect(row).toHaveProperty(expectedKey)
    expect(row[expectedKey].viewType).toBe('card')
    expect(row[expectedKey].editType).toBe('card')
    expect(row[expectedKey].property.tableId).toBe(expectedKey)
    expect(row[expectedKey].property.lineId).toBe('基本情報-lineId')
  })
})
