/**
 * BuildLayoutBlockWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  BuildCellRefAC,
  ConcatStringAC,
  FirstRowAC, ParseToArrayAC,
  RetrieveColumnAC,
  SearchLayoutTemplateTypeAC,
  SearchLayoutTemplateTypeByValueAC,
  SearchLineAC,
} from "../../common/activities";
import {
  BuildLayoutBlockKeyWF,
  BuildLayoutBlockRowWF,
} from '../workflows'
import { NCat } from "~/constants/NCat";
import {Column} from "~/constants/Column";
import {Key} from "~/constants/Key";
import {LayoutVueType} from "~/constants/LayoutVueType";
import {UCat} from "~/constants/UCat";

export type BuildLayoutBlockWFPayload = {
  tableId: string
  key: string
  nCat: string
  parentId: string
  parentKey: string | null

  nodeId: string
  nodeLabels: string[]
}

export type BuildLayoutBlockWFResult = {
  layoutRows: any[]
}

export const BuildLayoutBlockWF: ActivityFunction = async (
  payload: BuildLayoutBlockWFPayload
): Promise<BuildLayoutBlockWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockWF] 実行開始:', payload)

  const output: BuildLayoutBlockWFResult = {
    layoutRows: [],
  }

  //

  const _output_searchLineACOrder = await SearchLineAC({
    // searchType: 2,
    tableId: payload.tableId,
    key: Key.ORDER,
    nCat: NCat.LINE,
    parentId: payload.parentId,
  })
  const orderLineId = await FirstRowAC({
    rows: _output_searchLineACOrder.lineIds,
  })
  const outputRetrieveColumnACOrder = await RetrieveColumnAC({
    tableId: payload.tableId,
    lineId: orderLineId,
    column: Column.VALUE,
  })
  const orderValue = await FirstRowAC({
    rows: outputRetrieveColumnACOrder.columns,
  })

  // anchorUcat
  const outputRetrieveColumnAC = await RetrieveColumnAC({
    tableId: payload.tableId,
    lineId: payload.parentId,
    column: Column.U_CAT,
  })
  const anchorUcat = await FirstRowAC({
    rows: outputRetrieveColumnAC.columns,
  })

  if (anchorUcat != UCat.OPTION) {

    //
    const output_buildLayoutBlockKeyParent = await BuildLayoutBlockKeyWF({
      parentKey: payload.parentKey,
      blockKey: payload.parentId,
    })
    const blockKeyAnchor = output_buildLayoutBlockKeyParent.blockKey

    const outputBuildLayoutBlockRowWFParent = await BuildLayoutBlockRowWF({
      tableId: payload.tableId,
      lineId: payload.parentId,
      blockKey: blockKeyAnchor,
      instViewType: LayoutVueType.CARD,
      instEditType: LayoutVueType.CARD,
      tplViewType: LayoutVueType.CARD,
      tplEditType: LayoutVueType.CARD,
      propertyKey: Column.U_CAT,
      propertyValue: anchorUcat,

      nodeId: payload.nodeId,
      nodeLabels: payload.nodeLabels,
      order: orderValue,
    })
    output.layoutRows.push(outputBuildLayoutBlockRowWFParent.layoutRow)

    // line ===============


    const _output_searchLineAC = await SearchLineAC({
      // searchType: 2,
      tableId: payload.tableId,
      key: payload.key,
      nCat: NCat.LINE,
      parentId: payload.parentId,
    })

    console.log('loop 2')
    let optionValue = null;
    for (const lineId of _output_searchLineAC.lineIds) {

      // option ===============
      const outputSearchLineAC = await SearchLineAC({
        tableId: payload.tableId,
        nCat: NCat.ANCHOR,
        uCat: UCat.OPTION,
        parentId: lineId
      })

      console.log('loop 3')
      for (const optAnchorId of outputSearchLineAC.lineIds) {

        const outputSearchLineAC = await SearchLineAC({
          tableId: payload.tableId,
          nCat: NCat.LINE,
          key: Key.VALUE,
          parentId: optAnchorId
        })

        const optLineId = await FirstRowAC({
          rows: outputSearchLineAC.lineIds,
        })

        const outputRetrieveColumnAC = await RetrieveColumnAC({
          tableId: payload.tableId,
          lineId: optLineId,
          column: Key.VALUE,
        })
        const value = await FirstRowAC({
          rows: outputRetrieveColumnAC.columns,
        })
        optionValue = await ParseToArrayAC({
          text: value,
        })
      }

      // ====

      const output_buildLayoutBlockKeyLine = await BuildLayoutBlockKeyWF({
        parentKey: blockKeyAnchor,
        blockKey: lineId
      })
      const blockKeyLine = output_buildLayoutBlockKeyLine.blockKey

      const outputBuildLayoutBlockRowWFLine = await BuildLayoutBlockRowWF({
        tableId: payload.tableId,
        lineId: lineId,
        blockKey: blockKeyLine,
        instViewType: LayoutVueType.CARD,
        instEditType: LayoutVueType.CARD,
        tplViewType: LayoutVueType.CARD,
        tplEditType: LayoutVueType.CARD,
        layoutProperty: { layout: 'grid' },
        propertyKey: Column.U_CAT,
        propertyValue: anchorUcat,

        nodeId: payload.nodeId,
        nodeLabels: payload.nodeLabels,

        nCat: NCat.LINE,
      })
      output.layoutRows.push(outputBuildLayoutBlockRowWFLine.layoutRow)


      const outputRetrieveColumnAC = await RetrieveColumnAC({
        tableId: payload.tableId,
        lineId: lineId,
        column: Column.KEY,
      })
      const keyCell = await FirstRowAC({
        rows: outputRetrieveColumnAC.columns,
      })

      console.log('loop 4')
      for (const column of [Column.N_CAT, Column.U_CAT, Column.DEP_ID, Column.KEY, Column.I_TYPE, Column.F_TYPE, Column.VALUE]) {

        const outputRetrieveColumnAC = await RetrieveColumnAC({
          tableId: payload.tableId,
          lineId: lineId,
          column: column,
        })
        const cell = await FirstRowAC({
          rows: outputRetrieveColumnAC.columns,
        })

        const outputBuildCellRefAC = await BuildCellRefAC({
          tableId: payload.tableId,
          lineId: lineId,
          key: column,
        })

        //
        const output_buildLayoutBlockKeyCell = await BuildLayoutBlockKeyWF({
          parentKey: blockKeyLine,
          blockKey: outputBuildCellRefAC.cellRef
        })
        const blockKeyCell = output_buildLayoutBlockKeyCell.blockKey

        const outputBuildLayoutBlockRowWFCell = await BuildLayoutBlockRowWF({
          tableId: payload.tableId,
          lineId: lineId,
          blockKey: blockKeyCell,
          instViewType: LayoutVueType.CARD,
          instEditType: LayoutVueType.CARD,
          tplViewType: LayoutVueType.CARD,
          tplEditType: LayoutVueType.CARD,
          propertyKey: Column.U_CAT,
          propertyValue: anchorUcat,

          nodeId: payload.nodeId,
          nodeLabels: payload.nodeLabels,
        })
        output.layoutRows.push(outputBuildLayoutBlockRowWFCell.layoutRow)

        // ------

        let outputSearchLayoutTemplateType:any = null;
        let propertyColumn:any = null;
        let propertyOptionValue:any = null;

        if (column != Column.VALUE) {
          outputSearchLayoutTemplateType = await SearchLayoutTemplateTypeAC({
            lineKey: keyCell,
            column: column,
            anchorUcat: anchorUcat,
          })
          propertyColumn = column
        }
        else {
          const outputRetrieveColumnAC = await RetrieveColumnAC({
            tableId: payload.tableId,
            lineId: lineId,
            column: Column.F_TYPE,
          })
          const outputFirstRowAC = await FirstRowAC({
            rows: outputRetrieveColumnAC.columns,
          })

          outputSearchLayoutTemplateType = await SearchLayoutTemplateTypeByValueAC({
            lineKey: keyCell,
            fTypeColumn: outputFirstRowAC,
            anchorUcat: anchorUcat,
          })

          propertyColumn = outputFirstRowAC
          propertyOptionValue = optionValue
        }

        //
        const output_buildLayoutBlockKeyCard = await BuildLayoutBlockKeyWF({
          parentKey: blockKeyLine,
          blockKey: outputBuildCellRefAC.cellRef
        })
        const blockKeyCard = output_buildLayoutBlockKeyCard.blockKey

        const output_buildLayoutBlockKey = await BuildLayoutBlockKeyWF({
          parentKey: blockKeyCard,
          blockKey: outputBuildCellRefAC.cellRef
        })
        const blockKey = output_buildLayoutBlockKey.blockKey

        const output_ConcatStringAC = await ConcatStringAC({
          srcStr: blockKey,
          separator: '+',
          destStr: outputBuildCellRefAC.cellRef
        })

        const outputBuildLayoutBlockRowWF = await BuildLayoutBlockRowWF({
          tableId: payload.tableId,
          lineId: lineId,
          blockKey: output_ConcatStringAC.str,

          anchorUcat: anchorUcat,
          lineKey: keyCell,
          column: propertyColumn,

          instViewType: outputSearchLayoutTemplateType.instViewType,
          instEditType: outputSearchLayoutTemplateType.instEditType,
          instSelectType: outputSearchLayoutTemplateType.instSelectType,
          tplViewType: outputSearchLayoutTemplateType.tplViewType,
          tplEditType: outputSearchLayoutTemplateType.tplEditType,
          tplSelectType: outputSearchLayoutTemplateType.tplSelectType,
          propertyKey: column,
          propertyValue: cell,

          nodeId: payload.nodeId,
          nodeLabels: payload.nodeLabels,

          option: propertyOptionValue,
        })
        output.layoutRows.push(outputBuildLayoutBlockRowWF.layoutRow)
      }
    }


    // 1. SearchLineAC
    const output_searchLine = await SearchLineAC({
      tableId: payload.tableId,
      nCat: payload.nCat,
      key: payload.key,
      parentId: payload.parentId
    })

    for (const anchorId of output_searchLine.lineIds) {

      // 再帰呼び出し: BuildLayoutBlockWF
      const output_BuildLayoutBlockWF = await BuildLayoutBlockWF({
        tableId: payload.tableId,
        key: payload.key,
        nCat: payload.nCat,
        parentId: anchorId,
        parentKey: blockKeyAnchor,

        nodeId: payload.nodeId,
        nodeLabels: payload.nodeLabels,
      })
      output.layoutRows.push(...output_BuildLayoutBlockWF.layoutRows)
    }

  }

  const endTime = performance.now()
  console.log(`[BuildLayoutBlockWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutBlockWFDef = {
  name: 'BuildLayoutBlockWF',
  scope: 'common',
  description: 'レイアウトキーを構築するワークフロー'
}
