/**
 * BuildLayoutActionWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  SearchLayoutJsonAC,
  SearchLineAC,
  FirstRowAC,
  RetrieveColumnAC,
  SearchLayoutTemplateTypeAC,
  BuildLayoutBlockRowAC,
  CreateLayoutBlockPropertyAC,
  SeparateStringAC, GetLayoutParentKeyAC
} from '../activities'
import {
  BuildLayoutBlockKeyWF,
  DeployBlockWF
} from '../workflows'
import { Column } from "~/constants/Column";
import { Key } from "~/constants/Key";
import { UCat } from "~/constants/UCat";
import { GetLayoutActionConfigAC } from "../activities/GetLayoutActionConfigAC";

export type BuildLayoutActionWFPayload = {
  configId: string
  layoutRows: any[]
  containerId?: string
  timestamp?: number | string
  traceContainerIds?: string[]
  traceFlowIds?: string[]
}

export type BuildLayoutActionWFResult = {
  layoutRows: any[]
}

export const BuildLayoutActionWF: ActivityFunction = async (
  payload: BuildLayoutActionWFPayload
): Promise<BuildLayoutActionWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutActionWF] 実行開始:', payload)

  const output: BuildLayoutActionWFResult = {
    layoutRows: []
  }


  const output_GetLayoutActionConfigAC = await GetLayoutActionConfigAC({
    configId: payload.configId
  })


  for (const config of output_GetLayoutActionConfigAC.configs) {

    // 2. SearchLineAC で button_deploy を検索
    const output_searchLine_buttonRoot = await SearchLineAC({
      tableId: config.tableId,
      nCat: config.buttonNcat,
      key: config.buttonRootKey,
    })

    // 3. FirstRowAC で最初の row を取得
    const buttonRootLineId = await FirstRowAC({
      rows: output_searchLine_buttonRoot.lineIds
    })


    const output_deployBlockWF = await DeployBlockWF({
      tableId: config.tableId,
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
      isRoot: config.isRoot,
      instViewType: config.instViewType,
      instEditType: config.instEditType,
      instSelectType: config.instSelectType,
      tplViewType: config.tplViewType,
      tplEditType: config.tplEditType,
      tplSelectType: config.tplSelectType,
      anchorUcat: config.anchorUcat,
      lineKey: config.lineKey,
      propertyKey: config.propertyKey,
      propertyValue: config.propertyValue
    })

    for (const blockKeyCell of output_searchLayout.keys) {

      // const output_SeparateStringAC = await SeparateStringAC({
      //   separator: '+',
      //   str: blockKeyCell
      // })
      // const blockKey = await FirstRowAC({
      //   rows: output_SeparateStringAC.rows
      // })
      const output_GetLayoutParentKeyAC = await GetLayoutParentKeyAC({
        key: blockKeyCell
      })
      const blockKey = output_GetLayoutParentKeyAC.key

      const output_buildBlockKey = await BuildLayoutBlockKeyWF({
        parentKey: blockKey,
        blockKey: buttonAnchorLineId
      })

      const newBlockKey = output_buildBlockKey.blockKey

      // anchor-key =======================================

      // RetrieveColumnAC
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
        column: null,
        anchorUcat: null,
      })

      if (output_searchTemplate.instViewType === 'hidden' && output_searchTemplate.instEditType === 'hidden' && output_searchTemplate.instSelectType === 'hidden' && output_searchTemplate.tplViewType === 'hidden' && output_searchTemplate.tplEditType === 'hidden' && output_searchTemplate.tplSelectType === 'hidden') {
        console.warn(`[BuildLayoutActionWF] 全ての表示タイプが hidden です: ${anchorKey}`)
      }

      // =================================================================

      const keys = [Key.LABEL, Key.JOINT_ID, Key.DISPLAY, Key.SNACKING_CONFIG_ID, Key.LAYOUT_MAP_CONFIG_ID, Key.BUTTON_CONFIG_ID]
      const properties: Record<string, any> = {}

      for (const key of keys) {

        const output_searchLine_label = await SearchLineAC({
          tableId: buttonTableId,
          key: key,
          parentId: buttonAnchorLineId,
        })

        const labelLineId = await FirstRowAC({
          rows: output_searchLine_label.lineIds
        })

        const output_retrieve_label = await RetrieveColumnAC({
          tableId: buttonTableId,
          lineId: labelLineId,
          column: Column.VALUE,
        })

        const textLabel = await FirstRowAC({
          rows: output_retrieve_label.columns
        })

        properties[key] = textLabel
      }

      // ==================================

      // 15. CreateLayoutBlockPropertyAC
      const output_createLayoutBlockPropertyAC = await CreateLayoutBlockPropertyAC({
        tableId: buttonTableId,
        lineId: buttonAnchorLineId,

        flowId: newBlockKey,
        containerId: payload.containerId,
        timestamp: payload.timestamp,
        traceContainerIds: payload.containerId ? [...(payload.traceContainerIds || []), payload.containerId] : payload.traceContainerIds,
        traceFlowIds: newBlockKey ? [...(payload.traceFlowIds || []), newBlockKey] : payload.traceFlowIds,

        ...properties
      })

      // 16. BuildLayoutBlockRowAC
      const output_buildLayoutBlockRowAC = await BuildLayoutBlockRowAC({
        blockKey: newBlockKey,
        instViewType: output_searchTemplate.instViewType,
        instEditType: output_searchTemplate.instEditType,
        instSelectType: output_searchTemplate.instSelectType,
        tplViewType: output_searchTemplate.tplViewType,
        tplEditType: output_searchTemplate.tplEditType,
        tplSelectType: output_searchTemplate.tplSelectType,
        property: output_createLayoutBlockPropertyAC.property
      })

      output.layoutRows.push(output_buildLayoutBlockRowAC.layoutRow)

    }

  }

  const endTime = performance.now()
  console.log(`[BuildLayoutActionWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutActionWFDef = {
  name: 'BuildLayoutActionWF',
  scope: 'common',
  description: 'レイアウトボタンを構築する'
}
