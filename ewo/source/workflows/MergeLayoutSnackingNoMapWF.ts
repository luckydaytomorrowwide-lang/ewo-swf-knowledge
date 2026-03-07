/**
 * MergeLayoutMapWF
 */

import type { ActivityFunction } from '~/types/activity'

export type MergeLayoutMapWFPayload = {
  // blockKey: string
  anchorId: string
  structTableConfigRows: any[]
}

export type MergeLayoutMapWFResult = {
  layoutKeyRows: any[]
  anchorIndexRows: any[]
}
export const MergeLayoutSnackingNoMapWF: ActivityFunction = async (
  payload: MergeLayoutMapWFPayload
): Promise<MergeLayoutMapWFResult> => {
  const startTime = performance.now()
  console.log('[MergeLayoutMapWF] 実行開始:', payload)

  const output: MergeLayoutMapWFResult = {
    layoutKeyRows: []
  }

  for (const structTableConfigRow of payload.structTableConfigRows) {
    if (structTableConfigRow.anchorId == payload.anchorId) {
      const layoutKeyRow = {
        key: structTableConfigRow.blockKey,
        snackingNo: structTableConfigRow.snackingNo,
        anchorId: structTableConfigRow.anchorId,
        anchorUcat: structTableConfigRow.anchorUcat
      }
      output.layoutKeyRows.push(layoutKeyRow)
    }
  }

  const endTime = performance.now()
  console.log(`[MergeLayoutMapWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MergeLayoutMapWFDef = {
  name: 'MergeLayoutMapWF',
  scope: 'common',
  description: 'レイアウトマップをマージするワークフロー'
}
