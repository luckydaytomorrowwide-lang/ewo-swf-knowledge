import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateLayoutSnackingNoWF } from '../CreateLayoutSnackingNoWF'
import { SearchNodeAC } from '../../activities/SearchNodeAC'
import { RetrieveColumnAC } from '../../activities/RetrieveColumnAC'
import { FirstRowAC } from '../../activities/FirstRowAC'
import { CreateStructTableConfigWF } from '../CreateStructTableConfigWF'

vi.mock('../../activities/SearchNodeAC')
vi.mock('../../activities/RetrieveColumnAC')
vi.mock('../../activities/FirstRowAC')
vi.mock('../CreateStructTableConfigWF')

describe('CreateLayoutSnackingNoWF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('指定された条件で構造設定行が生成されること', async () => {
    const payload = {
      tableId: 'testTable',
      key: 'testKey',
      line: 'testLine',
      nCat: 'testNCat',
      sectionAnchorId: 'testAnchorId'
    }

    vi.mocked(SearchNodeAC).mockResolvedValue({ nodeIds: ['line1'] })
    vi.mocked(RetrieveColumnAC).mockResolvedValue({ columns: ['val'] })
    vi.mocked(FirstRowAC).mockImplementation(async (p) => p.rows[0])
    vi.mocked(CreateStructTableConfigWF).mockResolvedValue({
      structTableConfigRow: { mock: 'row' },
      anchorId: 'line1'
    })

    const result = await CreateLayoutSnackingNoWF(payload)

    expect(SearchNodeAC).toHaveBeenCalledWith({
      searchType: 2,
      nodeId: 'testAnchorId',
      edgeType: 'TREE_CONNECT',
      nodeLabel: ['testLine']
    })

    // 各ステップで3回ずつ呼ばれるはず
    expect(RetrieveColumnAC).toHaveBeenCalledTimes(3)
    expect(CreateStructTableConfigWF).toHaveBeenCalledTimes(3)

    expect(result.structTableConfigRows).toHaveLength(3)
    expect(result.structTableConfigRows[0]).toEqual({ mock: 'row' })
  })
})
