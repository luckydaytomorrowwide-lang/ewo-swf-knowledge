/**
 * BuildLayoutStructOldWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  CreateLayoutBlockPropertyAC,
  BuildLayoutBlockRowAC,
  GetLayoutButtonConfigAC,
} from '../activities'
import {
  GetNodeTableWF,
  DeployBlockWF,
  BuildLayoutBlockKeyWF,
  BuildLayoutBlockOldWF,
  BuildLayoutButtonWF,
  BuildLayoutBlockRowWF
} from './'
import {NCat} from "~/constants/NCat";

export type BuildLayoutStructOldWFPayload = {
  blockKey: string
  rows: any[]

  anchorKey?: String,
  lineKey?: String,
  column?: String,
}

export type BuildLayoutStructOldWFResult = {
  layoutRows: any[]
}

export const BuildLayoutStructOldWF: ActivityFunction = async (
    payload: BuildLayoutStructOldWFPayload
): Promise<BuildLayoutStructOldWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutStructOldWF] 実行開始:', payload)

  const output: BuildLayoutStructOldWFResult = {
    layoutRows: []
  }

  for (const row of payload.rows) {
    const nodeId = row

    // 1. GetNodeTableWF
    const output_getNodeTable = await GetNodeTableWF({
      nodeId: nodeId
    })
    const firstBlockId = output_getNodeTable.firstBlockId
    const tableId = output_getNodeTable.tableId

    // 2. DeployBlockWF
    // 画像では career_structs(tableId), 職歴01ブロック(firstBlockId), depth, type が入力
    // depth, type は画像には明示的な値がないが、既存のコードから推測
    const output_deployBlock = await DeployBlockWF({
      tableId: tableId,
      lineId: firstBlockId,
      depth: 10, // デフォルト値として
      type: 'default' // デフォルト値として
    })
    const tempTableId = output_deployBlock.tempTableId

    let blockKey = null;

    if (!payload?.anchorKey) {
      // 3. BuildLayoutAnchorKeyWF
      const output_buildLayoutAnchorKey = await BuildLayoutBlockKeyWF({
        parentKey: payload.blockKey,
        blockKey: firstBlockId
      })
      blockKey = output_buildLayoutAnchorKey.blockKey


      const output_buildLayoutBlockRowWF = await BuildLayoutBlockRowWF({
        tableId: tempTableId,
        lineId: firstBlockId,

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
    }

    // BuildLayoutBlockWF
    const output_buildLayoutBlock = await BuildLayoutBlockOldWF({
      tableId: tempTableId,
      blockKey: blockKey,
      anchorId: firstBlockId,

      anchorKey: payload.anchorKey,
      lineKey: payload.lineKey,
      column: payload.column,
    })

    output.layoutRows.push(...output_buildLayoutBlock.layoutRows)

    // ==========

    // ボタンコンフィグ
    // const output_getButtonConfig = await GetButtonConfigAC({
    //   type: 'default'
    // })
    // const layoutButtonConfig = output_getButtonConfig.configs
    //
    // for (const conf of layoutButtonConfig) {
    //
    //   const _output_buildLayoutButtonWF = await BuildLayoutButtonWF({
    //     json: output.layoutRows,
    //     isRoot: conf.isRoot,
    //     viewType: conf.viewType,
    //     editType: conf.editType,
    //
    //     tableId: 'button_structs',
    //     nCat: NCat.ANCHOR,
    //     key: conf.buttonRootKey,
    //   })
    //
    //   output.layoutRows.push(..._output_buildLayoutButtonWF.layoutRows)
    // }
  }

  const endTime = performance.now()
  console.log(`[BuildLayoutStructOldWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutStructOldWFDef = {
  name: 'BuildLayoutStructOldWF',
  scope: 'common',
  description: 'レイアウト構造を構築する'
}
