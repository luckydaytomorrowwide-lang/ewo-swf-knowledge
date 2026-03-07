import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeployBlockWF } from '../DeployBlockWF'
import { setActivePinia, createPinia } from 'pinia'

// 各コンポーネントのモック
vi.mock('../../common/activities/ConvertStructToDataTableNameAC', () => ({
    ConvertStructToDataTableNameAC: vi.fn(async ({ tableId }) => ({
        tableId: tableId.replace('_structs', '_data')
    }))
}))

vi.mock('../DeployBlockTemporaryWF', () => ({
    DeployBlockTemporaryWF: vi.fn(async ({ tableId }) => ({
        tempTableId: `${tableId}_temp`
    }))
}))

vi.mock('../../common/activities/MergeTableAC', () => ({
    MergeTableAC: vi.fn(async () => ({
        rows: [
            { line_id: 'L1', name: 'merged1' },
            { line_id: 'L2', name: 'merged2' }
        ]
    }))
}))

vi.mock('../../common/activities/BuildTemporaryTableIdAC', () => ({
    BuildTemporaryTableIdAC: vi.fn(async ({ tableId, ulid }) => ({
        tempTableId: `${tableId}_temporary_${ulid}`
    }))
}))

vi.mock('../../common/activities/PushRecordsAC', () => ({
    PushRecordsAC: vi.fn(async () => true)
}))

describe('DeployBlockWF', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('画像通りのフローで処理が実行され、正しい結果が返ること', async () => {
        const payload = {
            tableId: 'career_structs',
            lineId: 'root-lineid',
            depth: 3,
            type: 'typeA',
            ulid: 'testulid'
        }

        const result = await DeployBlockWF(payload)

        expect(result.tempTableId).toBe('career_temporary_testulid')
    })
})
