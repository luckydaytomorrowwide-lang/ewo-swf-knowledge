import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeployBlockTemporaryWF } from '../DeployBlockTemporaryWF'
import { useRdbStore } from '~/stores/rdb'
import { setActivePinia, createPinia } from 'pinia'

// モック
vi.mock('../../common/activities/RetrieveBlockAC', () => ({
    RetrieveBlockAC: vi.fn(async () => ({
        rows: [
            { lineId: 'L1', value: 'V1' },
            { lineId: 'L2', value: 'V2' }
        ]
    }))
}))

vi.mock('../../common/activities/PushRecordsAC', () => ({
    PushRecordsAC: vi.fn(async (payload) => {
        const rdbStore = useRdbStore()
        rdbStore.insert(payload.tableId, payload.afterRows)
        return true
    })
}))

vi.mock('./MakeTemporaryWF', () => ({
    MakeTemporaryWF: vi.fn(async (payload) => ({
        tempTableId: `${payload.tableId}_temp_123`
    }))
}))

describe('DeployBlockTemporaryWF', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('正常系: ブロックデータが取得され、プッシュおよびテンポラリテーブル作成が行われること', async () => {
        const payload = {
            tableId: 'career_structs',
            lineId: 'anchor_L1',
            depth: 1,
            type: 'test_type'
        }

        const result = await DeployBlockTemporaryWF(payload)

        // 結果の検証
        expect(result.tempTableId).toBe('career_structs_temp_123')

        // RDBストアの検証 (PushRecordsAC による登録)
        const rdbStore = useRdbStore()
        expect(rdbStore.rows['career_structs']).toBeDefined()
        expect(rdbStore.rows['career_structs']).toHaveLength(2)
        expect(rdbStore.rows['career_structs'][0].lineId).toBe('L1')
    })
})
