/**
 * BuildLayoutStructWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  GetNodeTableWF,
  DeployBlockWF,
  BuildLayoutBlockWF,
} from './'
import {NCat} from "~/constants/NCat";

export type BuildLayoutStructWFPayload = {
  rows: any[]
}

export type BuildLayoutStructWFResult = {
  layoutRows: any[]
}

export const BuildLayoutStructWF: ActivityFunction = async (
  payload: BuildLayoutStructWFPayload
): Promise<BuildLayoutStructWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutStructWF] 実行開始:', payload)

  const output: BuildLayoutStructWFResult = {
    layoutRows: []
  }

  for (const nodeId of payload.rows) {

    // 1. GetNodeTableWF
    const output_getNodeTable = await GetNodeTableWF({
      nodeId: nodeId
    })
    const firstBlockId = output_getNodeTable.firstBlockId
    const tableId = output_getNodeTable.tableId
    const nodeLabels = output_getNodeTable.nodeLabels

    // 2. DeployBlockWF
    // 画像では career_structs(tableId), 職歴01ブロック(firstBlockId), depth, type が入力
    // depth, type は画像には明示的な値がないが、既存のコードから推測
    const output_deployBlock = await DeployBlockWF({
      tableId: tableId,
      lineId: firstBlockId,
      // depth: 10, // デフォルト値として
      // type: 'default' // デフォルト値として
    })
    const tempTableId = output_deployBlock.tempTableId

    const output_BuildLayoutBlockWF = await BuildLayoutBlockWF({
      tableId: tempTableId,
      nCat: NCat.ANCHOR,
      key: null,
      parentId: firstBlockId,

      nodeId: nodeId,
      nodeLabels: nodeLabels,
    })
    output.layoutRows.push(...output_BuildLayoutBlockWF.layoutRows)
  }

  
  const endTime = performance.now()
  console.log(`[BuildLayoutStructWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutStructWFDef = {
  name: 'BuildLayoutStructWF',
  scope: 'common',
  description: 'レイアウト構造を構築する'
}
