/**
 * BuildLayoutBlockLineRowWF
 */

import type { ActivityFunction } from '~/types/activity'
import {CreateLayoutBlockPropertyAC, BuildLayoutBlockRowAC, ConvertDeployToStructTableNameAC} from '../activities'

export type BuildLayoutBlockLineRowWFPayload = {
  tableId: string
  lineId: string

  blockKey: string

  anchorUcat?: string
  lineKey?: string
  column?: string

  instViewType?: string
  instEditType?: string
  instSelectType?: string
  tplViewType?: string
  tplEditType?: string
  tplSelectType?: string

  layoutProperty?: Record<string, any>

  propertyKey?: string | null
  propertyValue?: any

  key?: string | null
  label?: string
  jointId?: string
  value?: any
  nCat?: string | null
  uCat?: string | null
  parentId?: string | null
  depId?: string | null
  iType?: string | null
  fType?: string | null

  nodeId?: string | null,
  nodeLabels?: string[] | null,
  order?: number | string | null,

  option?: any
}

export type BuildLayoutBlockLineRowWFResult = {
  layoutRow: any
}

export const BuildLayoutBlockRowWF: ActivityFunction = async (
  payload: BuildLayoutBlockLineRowWFPayload
): Promise<BuildLayoutBlockLineRowWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockRowWF] 実行開始:', payload)

  const outputConvertDeployToStructTableNameAC = await ConvertDeployToStructTableNameAC({
    tableId: payload.tableId,
  })
  const tableId = outputConvertDeployToStructTableNameAC.tableId

  // 1. CreateLayoutBlockPropertyAC
  const output_createProperty = await CreateLayoutBlockPropertyAC({
    tableId: tableId,
    lineId: payload.lineId,

    anchorUcat: payload.anchorUcat,
    lineKey: payload.lineKey,
    column: payload.column,

    label: payload?.label,

    nCat: payload?.nCat,
    uCat: payload?.uCat,
    parentId: payload?.parentId,
    depId: payload?.depId,
    key: payload?.key ?? payload?.propertyKey,
    iType: payload?.iType,
    fType: payload?.fType,
    value: payload?.value ?? payload?.propertyValue,

    nodeId: payload?.nodeId,
    nodeLabels: payload?.nodeLabels,
    order: payload?.order,

    option: payload?.option,
  })

  // 2. BuildLayoutBlockRowAC
  if (payload.tableId && payload.lineId && payload.key) {
    output_createProperty.property.cell = `table:${payload.tableId}|lineId:${payload.lineId}|key:${payload.key}`
  }

  const output_buildBlockRow = await BuildLayoutBlockRowAC({
    blockKey: payload.blockKey,
    instViewType: payload?.instViewType,
    instEditType: payload?.instEditType,
    instSelectType: payload?.instSelectType,
    tplViewType: payload?.tplViewType,
    tplEditType: payload?.tplEditType,
    tplSelectType: payload?.tplSelectType,
    layoutProperty: payload?.layoutProperty,
    property: output_createProperty.property
  })

  const result: BuildLayoutBlockLineRowWFResult = {
    layoutRow: output_buildBlockRow.layoutRow
  }

  const endTime = performance.now()
  console.log(`[BuildLayoutBlockRowWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const BuildLayoutBlockLineRowWFDef = {
  name: 'BuildLayoutBlockLineRowWF',
  scope: 'common',
  description: '単一のLineからレイアウトブロックの行を構築する'
}
