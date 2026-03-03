/**
 * BuildLayoutBlockOldWF
 */

import type { ActivityFunction } from '~/types/activity'
import {SearchLineAC} from '../activities'
import {BuildLayoutBlockKeyWF, BuildLayoutBlockDataWF, BuildLayoutBlockRowWF} from '../workflows'
import {NCat} from "~/constants/NCat";

export type BuildLayoutBlockOldWFPayload = {
  tableId: string
  blockKey: string
  anchorId: string

  anchorKey?: String,
  lineKey?: String,
  column?: String,
}

export type BuildLayoutBlockOldWFResult = {
  layoutRows: any[]
}

export const BuildLayoutBlockOldWF: ActivityFunction = async (
  payload: BuildLayoutBlockOldWFPayload
): Promise<BuildLayoutBlockOldWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockOldWF] 実行開始:', payload)

  const output: BuildLayoutBlockOldWFResult = {
    layoutRows: []
  }


  // つまみ食いパターン
  if (payload.anchorKey) {
    // 1. SearchLineAC でアンカーを検索
    const output_searchLine = await SearchLineAC({
      tableId: payload.tableId,
      key: payload?.anchorKey,
      nCat: NCat.ANCHOR,
      // parentId: payload.anchorId
    })

    for (const lineId of output_searchLine.lineIds) {
      const output_buildLayoutBlockData = await BuildLayoutBlockDataWF({
        tableId: payload.tableId,
        anchorId: lineId,

        lineKey: payload?.lineKey,
        column: payload.column,
      })
      output.layoutRows.push(...output_buildLayoutBlockData.layoutRows)
    }
  }

  // 格納パターン
  else {
    // 1. SearchLineAC でアンカーを検索
    const output_searchLine = await SearchLineAC({
      tableId: payload.tableId,
      // key: payload?.anchorKey,
      nCat: NCat.ANCHOR,
      parentId: payload.anchorId
    })

    // 2. 取得した anchorIds に対してループ
    for (const lineId of output_searchLine.lineIds) {

      const output_buildLayoutBlockKey = await BuildLayoutBlockKeyWF({
        parentKey: payload.blockKey,
        blockKey: lineId,
      })
      const blockKey = output_buildLayoutBlockKey.blockKey


      const output_buildLayoutBlockRowWF = await BuildLayoutBlockRowWF({
        tableId: payload.tableId,
        lineId: lineId,

        blockKey: blockKey,
        instViewType: 'card',
        instEditType: 'card',
        tplViewType: 'card',
        tplEditType: 'card',

        label: null,
        value: null,
        jointId: null,
      })
      output.layoutRows.push(output_buildLayoutBlockRowWF.layoutRow)


      // BuildLayoutBlockDataWF を呼び出し
      const output_buildLayoutBlockData = await BuildLayoutBlockDataWF({
        blockKey: blockKey,
        tableId: payload.tableId,
        anchorId: lineId,

        lineKey: payload?.lineKey,
        column: payload.column,
      })
      output.layoutRows.push(...output_buildLayoutBlockData.layoutRows)
    }
  }




  const endTime = performance.now()
  console.log(`[BuildLayoutBlockOldWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutBlockOldWFDef = {
  name: 'BuildLayoutBlockOldWF',
  scope: 'common',
  description: 'レイアウトブロックを構築する'
}
