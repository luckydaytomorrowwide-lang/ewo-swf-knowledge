/**
 * BuildLayoutSingleWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  GetLayoutButtonConfigAC,
  PushRecordsAC,
  RetrieveTableAC,
  PaddingLayoutBlockAC,
  AddFormDataStoreByOutputJsonAC
} from '../activities'
import {
  BuildLayoutStructWF,
  BuildLayoutButtonWF,
} from './'
import { NCat } from "~/constants/NCat";
import { Key } from "../../../constants/Key";
import { BuildLayoutActionWF } from "./BuildLayoutActionWF";

export type BuildLayoutSingleWFPayload = {
  rows: any[]
  containerId?: string
  timestamp?: number | string
  traceContainerIds?: string[]
  traceFlowIds?: string[]

  configId: string
}

export type BuildLayoutSingleWFResult = {
  layoutRows: any[]
}

export const BuildLayoutSingleWF: ActivityFunction = async (
  payload: BuildLayoutSingleWFPayload
): Promise<BuildLayoutSingleWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutSingleWF] 実行開始:', payload)

  const output: BuildLayoutSingleWFResult = {
    layoutRows: []
  }

  // ==== 準備
  const _output_structTable = await RetrieveTableAC({
    tableId: 'button_structs'
  })
  await PushRecordsAC({
    tableId: 'button_structs',
    afterRows: { button_structs: _output_structTable.rows }
  })
  const _output_dataTable = await RetrieveTableAC({
    tableId: 'button_data'
  })
  await PushRecordsAC({
    tableId: 'button_data',
    afterRows: { button_data: _output_dataTable.rows }
  })
  // ====

  const output_buildLayoutStructWF = await BuildLayoutStructWF({
    rows: payload.rows,

    // anchorKey: NCat.ANCHOR,
    // lineKey: null,
    // column: config.column,
  })
  output.layoutRows.push(...output_buildLayoutStructWF.layoutRows)

  // ==============================================
  const _output_AddAnswerStoreByOutputJsonAC = await AddFormDataStoreByOutputJsonAC({
    layoutRows: output.layoutRows,
    // containerId: null,
    // flowId: null,
  })

  // ==============================================
  const _output_BuildLayoutActionWF = await BuildLayoutActionWF({
    layoutRows: output.layoutRows,
    configId: payload.configId,
    containerId: payload.containerId,
    timestamp: payload.timestamp,
    traceContainerIds: payload.traceContainerIds,
    traceFlowIds: payload.traceFlowIds,
  })
  output.layoutRows.push(..._output_BuildLayoutActionWF.layoutRows)

  const endTime = performance.now()
  console.log(`[BuildLayoutSingleWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutSingleWFDef = {
  name: 'BuildLayoutSingleWF',
  scope: 'common',
  description: 'レイアウト構造を構築する'
}
