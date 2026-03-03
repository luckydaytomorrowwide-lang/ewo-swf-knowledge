/**
 * UpdateCellWF Workflow
 * 
 * 指定された行データの集合に対してセル更新処理を実行する
 * 
 * Input:
 *   - rows: 更新対象のデータ配列
 *     - key: 更新対象のキー
 *     - cell: CellRef文字列
 *     - data: 更新する値
 * 
 * Output:
 *   - updates: 実行された更新情報の配列
 */

import type { ActivityFunction } from '~/types/activity'
import {
  ParseCellRefAC,
  BuildUpdateCellJsonAC,
  UpdateCellAC
} from '../activities'

export interface UpdateCellWFPayload {
  formRows: Array<{
    cell: string
    data: any
  }>
}

export interface UpdateCellWFResult {
  updates: any[]
}

export const UpdateCellWF: ActivityFunction = async (
  payload: UpdateCellWFPayload
): Promise<UpdateCellWFResult> => {
  const startTime = performance.now()
  console.log('[UpdateCellWF] 実行開始:', payload)

  const updates: string[] = []

  for (const row of payload.formRows) {
    // 1. ParseCellRefAC
    const output_parseCellRef = await ParseCellRefAC({
      cellRef: row.cell
    })

    if (output_parseCellRef) {
      // 2. BuildUpdateCellJsonAC
      const output_buildUpdateCellJson = await BuildUpdateCellJsonAC({
        tableId: output_parseCellRef.table,
        lineId: output_parseCellRef.lineId,
        key: output_parseCellRef.key,
        value: row.data
      })

      updates.push(output_buildUpdateCellJson.json)
    }
  }

  // 3. UpdateCellAC
  const output_updateCell = await UpdateCellAC({
    updates: updates
  })

  const result = {
    updates: output_updateCell.updates
  }

  const endTime = performance.now()
  console.log(`[UpdateCellWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const UpdateCellWFDef = {
  name: 'UpdateCellWF',
  scope: 'common',
  description: 'セルの値を一括更新する'
}
