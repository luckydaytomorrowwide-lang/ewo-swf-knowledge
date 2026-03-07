import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BuildLayoutBlockKeyWF } from '../BuildLayoutBlockKeyWF'
import { setActivePinia, createPinia } from 'pinia'

// Activitiesのモック
vi.mock('../../common/activities', () => ({
  CreateLayoutBlockKeyAC: vi.fn(async (payload) => ({
    str: `${payload.name || 'block'}[${payload.key}]`
  })),
  ConcatStringAC: vi.fn(async (payload) => ({
    str: `${payload.srcStr}${payload.separator}${payload.destStr}`
  }))
}))

describe('BuildLayoutAnchorKeyWF', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('画像通りのフローで処理が実行され、正しいアンカー文字列が返ること', async () => {
    const payload = {
      parentKey: 'root',
      blockKey: '123'
    }

    const result = await BuildLayoutBlockKeyWF(payload)

    // block[123] が生成され、root.block[123] に結合されることを期待
    expect(result.blockKey).toBe('root.block[123]')
  })

  it('parentKeyがnullの場合でも正しく動作すること', async () => {
    const payload = {
      parentKey: null,
      blockKey: '456'
    }

    const result = await BuildLayoutBlockKeyWF(payload)

    // .block[456] になる (ConcatStringAC の仕様上、srcStrが空文字になるため)
    expect(result.blockKey).toBe('.block[456]')
  })
})
