import { describe, it, expect, vi } from 'vitest'
import { AddCopyBlockWF } from '../AddCopyBlockWF'
import { ofetch } from 'ofetch'

// ofetch のモック
vi.mock('ofetch', () => ({
  ofetch: vi.fn()
}))

describe('AddCopyBlockWF', () => {
  it('正常系: APIが呼ばれ、rootLineIdが返されること', async () => {
    const payload = {
      targetTableId: 'target_struct',
      sourceTableId: 'source_struct',
      sourceLineId: 'S1',
      parentLineId: 'P1',
      depth: 1
    }

    // APIレスポンスのモック設定
    ;(ofetch as any).mockResolvedValue({
      result: {
        rootLineId: 'new_root_L1'
      }
    })

    const result = await AddCopyBlockWF(payload)

    // APIが正しく呼ばれたか検証
    expect(ofetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/workflow', {
      method: 'POST',
      body: {
        workflow: 'AddCopyBlockWF',
        ...payload
      }
    })

    // 結果の検証
    expect(result.rootLineId).toBe('new_root_L1')
  })

  it('異常系: APIが失敗した場合にエラーがスローされること', async () => {
    const payload = {
      targetTableId: 'target_struct',
      sourceTableId: 'source_struct',
      sourceLineId: 'S1',
      parentLineId: 'P1'
    }

    // 失敗レスポンスのモック設定
    ;(ofetch as any).mockResolvedValue({
      result: null
    })

    await expect(AddCopyBlockWF(payload)).rejects.toThrow('Failed to execute AddCopyBlockWF')
  })
})
