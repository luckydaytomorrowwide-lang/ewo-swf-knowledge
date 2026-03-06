/**
 * CreateStructTableConfigWF
 */

import type { ActivityFunction } from '~/types/activity'

export type CreateStructTableConfigWFPayload = {
  tableId: string
  column: string
  lineId: string
  anchorId: string
  anchorUcat: string
  blockKey: string
}

export type CreateStructTableConfigWFResult = {
  structTableConfigRow
}

export const CreateStructTableConfigWF: ActivityFunction = async (
  payload: CreateStructTableConfigWFPayload
): Promise<CreateStructTableConfigWFResult> => {
  const startTime = performance.now()
  console.log('[CreateStructTableConfigWF] 実行開始:', payload)

  const no = `table:${payload.tableId}|lineId:${payload.lineId}|key:${payload.column}`
  const structTableConfigRow = {
    anchorId: payload.anchorId,
    anchorUcat: payload.anchorUcat,
    snackingNo: no,

    blockKey: payload.blockKey,
  }

  const output: CreateStructTableConfigWFResult = {
    structTableConfigRow: structTableConfigRow,
  }

  const endTime = performance.now()
  console.log(`[CreateStructTableConfigWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const CreateStructTableConfigWFDef = {
  name: 'CreateStructTableConfigWF',
  scope: 'common',
  description: '構造テーブル設定を作成する'
}
