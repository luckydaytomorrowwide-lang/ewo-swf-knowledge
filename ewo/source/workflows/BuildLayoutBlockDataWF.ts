/**
 * BuildLayoutBlockDataWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  SearchLineAC,
  FirstRowAC,
  RetrieveColumnAC,
  SearchLayoutTemplateTypeAC,
  CreateLayoutBlockPropertyAC,
  RetrieveCellrefAC,
} from "../../common/activities";
import {
  BuildLayoutBlockKeyWF,
  BuildLayoutBlockRowWF,
  BuildLayoutBlockOldWF
} from '../../common/workflows'
import {NCat} from "~/constants/NCat";
import {Column} from "~/constants/Column";

export type BuildLayoutBlockDataWFPayload = {
  blockKey: string
  tableId: string
  anchorId: string

  lineKey?: string
  column?: string
}

export type BuildLayoutBlockDataWFResult = {
  layoutRows: any[]
}

export const BuildLayoutBlockDataWF: ActivityFunction = async (
  payload: BuildLayoutBlockDataWFPayload
): Promise<BuildLayoutBlockDataWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockDataWF] 実行開始:', payload)

  const output: BuildLayoutBlockDataWFResult = {
    layoutRows: []
  }

  // anchorUcat
  const outputRetrieveColumnAC = await RetrieveColumnAC({
    tableId: payload.tableId,
    lineId: payload.anchorId,
    column: Column.U_CAT,
  })
  const anchorUcat = await FirstRowAC({
    rows: outputRetrieveColumnAC.columns,
  })



  // 1. SearchLineAC
  const output_searchLine = await SearchLineAC({
    tableId: payload.tableId,
    nCat: NCat.LINE,
    key: payload?.lineKey,
    parentId: payload.anchorId
  })

  for (const lineId of output_searchLine.lineIds) {

    // 3. BuildLayoutAnchorKeyWF
    const output_buildLayoutBlockKey = await BuildLayoutBlockKeyWF({
      parentKey: payload.blockKey,
      blockKey: lineId
    })
    const newBlockKey = output_buildLayoutBlockKey.blockKey

    // 4. カラムデータ取得 (key)
    const output_retrieveColumnKey = await RetrieveColumnAC({
      tableId: payload.tableId,
      lineId: lineId,
      column: Column.KEY
    })
    const lineKey = await FirstRowAC({
      rows: output_retrieveColumnKey.columns
    })

    // 6. SearchLayoutTemplateTypeAC
    const output_searchLayoutTemplateType = await SearchLayoutTemplateTypeAC({
      anchorUcat: anchorUcat,
      lineKey: lineKey,
      column: payload?.column
    })

    const columns = {}
    for (const column of [Column.KEY, Column.N_CAT, Column.U_CAT, Column.PARENT_ID, Column.DEP_ID, Column.I_TYPE, Column.F_TYPE, Column.VALUE]) {
      // if (payload?.column && payload?.column != column) continue

      // 4. カラムデータ取得 (key)
      const output_retrieveColumns = await RetrieveColumnAC({
        tableId: payload.tableId,
        lineId: lineId,
        column: column
      })
      const output_firstRowColumn = await FirstRowAC({
        rows: output_retrieveColumns.columns
      })

      const camelColumn = column
          .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
          .replace(/^(.)/, (m) => m.toLowerCase())
      if ([Column.N_CAT, Column.U_CAT, Column.I_TYPE, Column.F_TYPE, Column.VALUE].includes(column)) {
        const output_retrieveCellrefAC = await RetrieveCellrefAC({
          cellref: output_firstRowColumn
        })
        columns[camelColumn] = output_retrieveCellrefAC.value
      } else {
        columns[camelColumn] = output_firstRowColumn
      }
    }

    // 7. CreateLayoutBlockPropertyAC
    const output_createLayoutBlockProperty = await CreateLayoutBlockPropertyAC({
      tableId: payload.tableId,
      lineId: lineId,
      key: lineKey,
      ...columns
    })
    const output_buildLayoutBlockRowWF = await BuildLayoutBlockRowWF({
      tableId: payload.tableId,
      lineId: lineId,

      blockKey: newBlockKey,
      // viewType: output_searchLayoutTemplateType.viewTemplateType,
      // editType: output_searchLayoutTemplateType.editTemplateType,
      instViewType: output_searchLayoutTemplateType.instViewType,
      instEditType: output_searchLayoutTemplateType.instEditType,
      tplViewType: output_searchLayoutTemplateType.tplViewType,
      tplEditType: output_searchLayoutTemplateType.tplEditType,

      key: lineKey,
      ...columns
    })
    output.layoutRows.push(output_buildLayoutBlockRowWF.layoutRow)

  }

  if (!payload.lineKey) {
    const output_buildLayoutBlock = await BuildLayoutBlockOldWF({
      blockKey: payload.blockKey,
      tableId: payload.tableId,
      anchorId: payload.anchorId
    })
    output.layoutRows.push(...output_buildLayoutBlock.layoutRows)
  }
  
  const endTime = performance.now()
  console.log(`[BuildLayoutBlockDataWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutBlockDataWFDef = {
  name: 'BuildLayoutBlockDataWF',
  scope: 'common',
  description: 'レイアウトブロックデータを構築する'
}
