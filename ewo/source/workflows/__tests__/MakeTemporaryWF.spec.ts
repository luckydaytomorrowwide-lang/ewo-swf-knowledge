import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MakeTemporaryWF } from '../MakeTemporaryWF'
import { useRdbStore } from '../../../stores/rdb'
import { setActivePinia, createPinia } from 'pinia'

// モック
vi.mock('../../common/activities/CreateUlidAC', () => ({
    CreateUlidAC: vi.fn(async () => ({ ulid: '01ARZ3NDEKTSV4RRFFQ6KHNQZS' }))
}))
vi.mock('../../common/activities/BuildTemporaryTableIdAC', () => ({
    BuildTemporaryTableIdAC: vi.fn(async (payload) => ({ 
        tempTableId: `${payload.tableId}_temporary_${payload.ulid}`.toLowerCase() 
    }))
}))
vi.mock('../../common/activities/PushRecordsAC', () => ({
    PushRecordsAC: vi.fn(async (payload) => {
        const rdbStore = useRdbStore()
        rdbStore.insert(payload.tableId, payload.afterRows)
        return true
    })
}))

describe('MakeTemporaryWF', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('正常系: テンポラリテーブルが作成され、データが格納されること', async () => {
        const tableId = 'test_table'
        const rows = [
            { lineId: 'L1', value: 'V1' },
            { lineId: 'L2', value: 'V2' }
        ]

        const result = await MakeTemporaryWF({ tableId, rows })

        // 結果の検証
        expect(result.tempTableId).toMatch(/^test_temporary_[0-9A-HJKMNP-TV-Z]{26}$/)

        // RDBストアの検証
        const rdbStore = useRdbStore()
        expect(rdbStore.rows[result.tempTableId]).toBeDefined()
        expect(rdbStore.rows[result.tempTableId]).toHaveLength(2)
        expect(rdbStore.rows[result.tempTableId][0].lineId).toBe('L1')
    })
})
