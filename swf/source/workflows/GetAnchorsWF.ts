/**
 * GetAnchorsWF Activity (Jobseeker 専用)
 *
 * 親アンカー配下のラインのVAR_NAMEの値を起点に、子アンカー配下のラインのVAR_NAMEの値を取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {
    CreateEdgeAC,
    CreateInstanceAC,
    FirstRowAC,
    GetPageIdAC,
    RetrieveColumnAC,
    SearchLineAC,
    SearchNodeAC
} from "../../common/activities";
import { Label } from '~/constants/Label'
import { Edge } from '~/constants/Edge'
import {Key} from "../../../constants/Key";
import {NCat} from "../../../constants/NCat";
import {UCat} from "../../../constants/UCat";
import {Column} from "../../../constants/Column";

export type GetAnchorsWFPayload = {
    arg1: string // テーブルID
    arg2: string // 親アンカー配下の、keyカラムの値がVAR_NAMEのラインの、valueカラムの値
    arg3: string // 親アンカーのu_catカラムの値
    arg4: string // 子アンカー配下の、keyカラムの値がVAR_NAMEのラインの、valueカラムの値
}

export type GetAnchorsWFResult = {
    values: string[]
}

export const GetAnchorsWF: ActivityFunction = async (
    payload: GetAnchorsWFPayload
): Promise<GetAnchorsWFResult> => {
  const startTime = performance.now()
  console.log('[GetAnchorsWF] 実行開始:', payload)

    const tableId = payload.arg1
    const parentLineVarName = payload.arg2
    const parentAnchorUCat = payload.arg3
    const childAnchorUCat = payload.arg4
    // const childLineKey = payload.arg4

    const output: GetAnchorsWFResult = { values: [] }


    // 親アンカーのVAR_NAMEライン
    const input_parentLines = {
        tableId: tableId,
        tableType: 3,
        key: Key.VAR_NAME,
        value: parentLineVarName,
    }
    const output_parentLines = await SearchLineAC(input_parentLines)

    for ( const parentLine of output_parentLines.lineIds ) {

        // parent_id取得
        const input_lineParentIds = {
            tableId: tableId,
            tableType: 3,
            lineId: parentLine,
            column: Column.PARENT_ID,
        }
        const output_lineParentIds = await RetrieveColumnAC(input_lineParentIds)

        const input_lineParentId = {
            rows: output_lineParentIds.columns,
        }
        const output_lineParentId = await FirstRowAC(input_lineParentId)

        //
        const input_parentAnchors = {
            tableId: tableId,
            tableType: 3,
            lineId: output_lineParentId,
            nCat: NCat.ANCHOR,
            uCat: parentAnchorUCat,
        }
        const output_parentAnchors = await SearchLineAC(input_parentAnchors)

        for (const parentAnchors of output_parentAnchors.lineIds) {

            // 子アンカー
            const input_childAnchors = {
                tableId: tableId,
                tableType: 3,
                parentId: parentAnchors,
                nCat: NCat.ANCHOR,
                uCat: childAnchorUCat,
            }
            const output_childAnchors = await SearchLineAC(input_childAnchors)

            for (const childAnchor of output_childAnchors.lineIds) {

                // 子VAR_NAMEライン
                const input_childLines = {
                    tableId: tableId,
                    tableType: 3,
                    parentId: childAnchor,
                    nCat: NCat.LINE,
                    key: Key.VAR_NAME,
                }
                const output_childLines = await SearchLineAC(input_childLines)

                const input_childLine = {
                    rows: output_childLines.lineIds,
                }
                const output_childLine = await FirstRowAC(input_childLine)

                // valueカラムの値取得
                const input_lineValues = {
                    tableId: tableId,
                    tableType: 3,
                    lineId: output_childLine,
                    column: Column.VALUE,
                }
                const output_fldLineValues = await RetrieveColumnAC(input_lineValues)

                const input_fldLineValue = {
                    rows: output_fldLineValues.columns,
                }
                const output_fldLineValue = await FirstRowAC(input_fldLineValue)

                output.values.push(output_fldLineValue)
            }
        }
    }


    const endTime = performance.now()
    console.log(`[GetAnchorsWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetAnchorsWFDef = {
    name: 'GetAnchorsWF',
    scope: 'common',
    description: '親アンカー配下のラインのVAR_NAMEの値を起点に、子アンカー配下のラインのVAR_NAMEの値を取得する'
}
