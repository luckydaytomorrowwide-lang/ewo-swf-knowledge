import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateStructTableConfigWF } from '../CreateStructTableConfigWF'
import { CreateLayoutBlockPropertyAC } from '../../activities/CreateLayoutBlockPropertyAC'
import { BuildLayoutBlockRowAC } from '../../activities/BuildLayoutBlockRowAC'

vi.mock('../../activities/CreateLayoutBlockPropertyAC')
vi.mock('../../activities/BuildLayoutBlockRowAC')

describe('CreateStructTableConfigWF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正しい引数でアクティビティが呼び出されること', async () => {
    const payload = {
      tableId: 'table1',
      column: 'col1',
      lineId: 'line1',
      actual: 'actual1'
    }

    vi.mocked(CreateLayoutBlockPropertyAC).mockResolvedValue({ property: { prop: 'val' } })
    vi.mocked(BuildLayoutBlockRowAC).mockResolvedValue({ layoutRow: { row: 'data' } })

    const result = await CreateStructTableConfigWF(payload)

    expect(CreateLayoutBlockPropertyAC).toHaveBeenCalledWith({
      tableId: 'table1',
      lineId: 'line1',
      value: 'col1',
      actual: 'actual1'
    })

    expect(BuildLayoutBlockRowAC).toHaveBeenCalledWith({
      blockKey: 'line1',
      viewType: 'config',
      editType: 'config',
      property: { prop: 'val' }
    })

    expect(result.structTableConfigRow).toEqual({ row: 'data' })
  })
})
