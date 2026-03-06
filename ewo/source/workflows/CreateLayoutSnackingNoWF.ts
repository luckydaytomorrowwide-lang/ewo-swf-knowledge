/**
 * CreateLayoutSnackingNoWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  FirstRowAC,
  RetrieveColumnAC,
  SearchLineAC,
} from '../activities'
import {BuildLayoutBlockKeyWF, CreateStructTableConfigWF} from './'
import { Edge } from "~/constants/Edge";
import {Column} from "~/constants/Column";

export type CreateLayoutSnackingNoWFPayload = {
  tableId: string
  key: string
  line: string
  nCat: string
  lineId: string

  blockKey: string
  column: string
}

export type CreateLayoutSnackingNoWFResult = {
  structTableConfigRows: any[]
  lineIds: any[]
}

export const CreateLayoutSnackingNoWF: ActivityFunction = async (
  payload: CreateLayoutSnackingNoWFPayload
): Promise<CreateLayoutSnackingNoWFResult> => {
  const startTime = performance.now()
  console.log('[CreateLayoutSnackingNoWF] 実行開始:', payload)

  const output: CreateLayoutSnackingNoWFResult = {
    structTableConfigRows: [],
    lineIds: [],
  }

  const _output_RetrieveColumnAC = await RetrieveColumnAC({
    // searchType: 2,
    tableId: payload.tableId,
    lineId: payload.lineId,
    column: Column.U_CAT,
  })
  const _output_uCat = await FirstRowAC({
    rows: _output_RetrieveColumnAC.columns
  })


  const _output_searchLineAC = await SearchLineAC({
    // searchType: 2,
    tableId: payload.tableId,
    key: payload.key,
    nCat: payload.nCat,
    parentId: payload.lineId,
  })

  output.lineIds = _output_searchLineAC.lineIds


  // for (const lineId of lineIds) {
  for (const lineId of _output_searchLineAC.lineIds) {

    const output_buildLayoutBlockKeyParent = await BuildLayoutBlockKeyWF({
      parentKey: payload.blockKey,
      blockKey: lineId
    })
    const blockKey = output_buildLayoutBlockKeyParent.blockKey

    for (const column of [Column.N_CAT, Column.U_CAT, Column.DEP_ID, Column.KEY, Column.I_TYPE, Column.F_TYPE, Column.VALUE]) {

      const output_buildLayoutBlockKeyParent = await BuildLayoutBlockKeyWF({
        parentKey: blockKey,
        blockKey: column
      })
      const blockKeyColumn = output_buildLayoutBlockKeyParent.blockKey

      const _outputCreateStructTableConfigWF = await CreateStructTableConfigWF({
        tableId: payload.tableId,
        column: column,
        lineId: lineId,
        anchorId: payload.lineId,
        anchorUcat: _output_uCat,
        blockKey: blockKeyColumn,
      })
      output.structTableConfigRows.push(_outputCreateStructTableConfigWF.structTableConfigRow)

    }
  }

  const endTime = performance.now()
  console.log(`[CreateLayoutSnackingNoWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const CreateLayoutSnackingNoWFDef = {
  name: 'CreateLayoutSnackingNoWF',
  scope: 'common',
  description: 'つまみ食いレイアウトのNo用構造設定を作成する'
}
