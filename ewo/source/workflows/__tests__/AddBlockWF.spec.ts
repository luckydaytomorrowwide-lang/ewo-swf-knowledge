import { describe, it, expect, vi } from 'vitest'
import { AddBlockWF } from '../AddBlockWF'
import { ofetch } from 'ofetch'

// ofetch のモック
vi.mock('ofetch', () => ({
  ofetch: vi.fn()
}))

describe('AddBlockWF', () => {
  it('正常系: APIが呼ばれ、影響行数が返されること', async () => {
    const payload = {
      targetTableId: 'target_struct',
      targetParentId: 'P1',
      sourceTableId: 'source_struct',
      sourceLineId: 'S1',
      depth: 1
    }

    // APIレスポンスのモック設定
    ;(ofetch as any).mockResolvedValue({
      result: {
        affectedStructRowsCount: 5,
        affectedDataRowsCount: 5
      }
    })

    const result = await AddBlockWF(payload)

    // APIが正しく呼ばれたか検証
    expect(ofetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/workflow', {
      method: 'POST',
      body: {
        workflow: 'AddBlockWF',
        ...payload
      }
    })

    // 結果の検証
    expect(result.affectedStructRowsCount).toBe(5)
    expect(result.affectedDataRowsCount).toBe(5)
  })

  it('異常系: APIが失敗した場合にエラーがスローされること', async () => {
    const payload = {
      targetTableId: 'target_struct',
      sourceTableId: 'source_struct',
      sourceLineId: 'S1'
    }

    // 失敗レスポンスのモック設定
    ;(ofetch as any).mockResolvedValue({
      result: null
    })

    await expect(AddBlockWF(payload)).rejects.toThrow('Failed to execute AddBlockWF')
  })
})
