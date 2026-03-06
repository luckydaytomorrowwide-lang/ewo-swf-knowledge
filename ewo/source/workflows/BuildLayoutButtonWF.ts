/**
 * BuildLayoutButtonWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  SearchLayoutJsonAC,
  SearchLineAC,
  FirstRowAC,
  RetrieveColumnAC,
  SearchLayoutTemplateTypeAC,
  BuildLayoutBlockRowAC,
  CreateLayoutBlockPropertyAC
} from '../activities'
import {
  BuildLayoutBlockKeyWF,
  DeployBlockWF
} from '../workflows'
import { Column } from "~/constants/Column";
import { Key } from "~/constants/Key";
import { UCat } from "~/constants/UCat";

export type BuildLayoutButtonWFPayload = {
  layoutRows: any[]
  isRoot: boolean
  viewType: string
  editType: string
  propertyKey: string
  propertyValue: any

  tableId: string
  nCat: string
  key: string
}

export type BuildLayoutButtonWFResult = {
  layoutRows: any[]
}

export const BuildLayoutButtonWF: ActivityFunction = async (
  payload: BuildLayoutButtonWFPayload
): Promise<BuildLayoutButtonWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutButtonWF] 実行開始:', payload)

  const output: BuildLayoutButtonWFResult = {
    layoutRows: []
  }

  // 2. SearchLineAC で button_deploy を検索
  const output_searchLine_buttonRoot = await SearchLineAC({
    tableId: payload.tableId,
    nCat: payload.nCat,
    key: payload.key,
  })

  // 3. FirstRowAC で最初の row を取得
  const buttonRootLineId = await FirstRowAC({
    rows: output_searchLine_buttonRoot.lineIds
  })


  const output_deployBlockWF = await DeployBlockWF({
    tableId: payload.tableId,
    lineId: buttonRootLineId
  })
  const buttonTableId = output_deployBlockWF.tempTableId

  // 4. SearchLineAC で editBtn を検索
  const output_searchLine_buttonAnchor = await SearchLineAC({
    tableId: buttonTableId, // payload.tableId,
    uCat: UCat.BUTTON,
    parentId: buttonRootLineId
  })

  // 5. FirstRowAC で最初の row を取得
  const buttonAnchorLineId = await FirstRowAC({
    rows: output_searchLine_buttonAnchor.lineIds
  })

  // ========

  // 1. SearchLayoutJsonAC で blockKeys を取得
  const output_searchLayout = await SearchLayoutJsonAC({
    json: payload.layoutRows,
    isRoot: payload.isRoot,
    instViewType: (payload as any).instViewType || payload.viewType,
    instEditType: (payload as any).instEditType || payload.editType,
    tplViewType: (payload as any).tplViewType,
    tplEditType: (payload as any).tplEditType,
    anchorUcat: (payload as any).anchorUcat,
    lineKey: (payload as any).lineKey,
    propertyKey: payload.propertyKey,
    propertyValue: payload.propertyValue
  })

  for (const blockKey of output_searchLayout.keys) {

    // Todo
    const removeEndNumberBracketsBlockKey = blockKey.replace(/\.[^\.]+?$/, '')

    // 6. BuildLayoutAnchorKeyWF を呼び出し
    const output_buildBlockKey = await BuildLayoutBlockKeyWF({
      parentKey: removeEndNumberBracketsBlockKey,
      blockKey: buttonAnchorLineId
    })

    const newBlockKey = output_buildBlockKey.blockKey

    // anchor-key =======================================

    // 7. RetrieveColumnAC で label を取得 (editBtn-label)
    const output_retrieve_key = await RetrieveColumnAC({
      tableId: buttonTableId,
      lineId: buttonAnchorLineId,
      column: Column.KEY,
    })

    const anchorKey = await FirstRowAC({
      rows: output_retrieve_key.columns
    })

    // SearchLayoutTemplateTypeAC
    const output_searchTemplate = await SearchLayoutTemplateTypeAC({
      lineKey: anchorKey,
    })

    // label ========

    // 8. SearchLineAC (editBtn-label-lineIds)
    const output_searchLine_label = await SearchLineAC({
      tableId: buttonTableId,
      key: Key.LABEL,
      parentId: buttonAnchorLineId,
    })

    const labelLineId = await FirstRowAC({
      rows: output_searchLine_label.lineIds
    })

    // 9. RetrieveColumnAC (value)
    const output_retrieve_label = await RetrieveColumnAC({
      tableId: buttonTableId,
      lineId: labelLineId,
      column: Column.VALUE,
    })

    const textLabel = await FirstRowAC({
      rows: output_retrieve_label.columns
    })

    // jointId =========

    // 13. SearchLineAC (saveBtn)
    const output_searchLine_jointId = await SearchLineAC({
      tableId: buttonTableId,
      parentId: buttonAnchorLineId,
      key: Key.JOINT_ID,
    })

    const jointIdLineId = await FirstRowAC({
      rows: output_searchLine_jointId.lineIds
    })

    const output_retrieve_jointId = await RetrieveColumnAC({
      tableId: buttonTableId,
      lineId: jointIdLineId,
      column: Column.VALUE,
    })

    const jointId = await FirstRowAC({
      rows: output_retrieve_jointId.columns
    })

    // ==================================


    // 15. CreateLayoutBlockPropertyAC
    const output_createLayoutBlockPropertyAC = await CreateLayoutBlockPropertyAC({
      tableId: buttonTableId,
      lineId: buttonAnchorLineId,

      flowId: newBlockKey,

      buttonLabel: textLabel,
      buttonJointId: jointId,
    })

    // 16. BuildLayoutBlockRowAC
    const output_buildLayoutBlockRowAC = await BuildLayoutBlockRowAC({
      blockKey: newBlockKey,
      viewType: output_searchTemplate.viewTemplateType,
      editType: output_searchTemplate.editTemplateType,
      property: output_createLayoutBlockPropertyAC.property
    })

    output.layoutRows.push(output_buildLayoutBlockRowAC.layoutRow)

  }

  const endTime = performance.now()
  console.log(`[BuildLayoutButtonWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutButtonWFDef = {
  name: 'BuildLayoutButtonWF',
  scope: 'common',
  description: 'レイアウトボタンを構築する'
}
