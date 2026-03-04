/**
 * GetTabWF Activity (Jobseeker 専用)
 *
 * ラインのVAR_NAMEの値を起点に、セルの値を取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {FirstRowAC, RetrieveColumnAC, SearchLineAC} from "../../common/activities";
import {Key} from "../../../constants/Key";
import {NCat} from "../../../constants/NCat";
import {UCat} from "../../../constants/UCat";
import {Column} from "../../../constants/Column";

export type GetTabWFPayload = {
    arg1: string
    arg2: string
}

export type GetTabWFResult = {
    text: any
    jointId: any
}

export const GetTabWF: ActivityFunction = async (
    payload: GetTabWFPayload
): Promise<GetTabWFResult> => {
  const startTime = performance.now()
  console.log('[GetTabWF] 実行開始:', payload)

    const tableId = payload.arg1
    const varName = payload.arg2

    
    const output: GetTabWFResult = { text: null, jointId: null }

    // root anchor lineId ============================================================

    const input_varNameUlids = {
        tableId: tableId,
        tableType: 3,
        key: Key.VAR_NAME,
        value: varName,
    }
    const output_varNameUlids = await SearchLineAC(input_varNameUlids)

    const varNameUlids = output_varNameUlids.lineIds

    for (const varNameUlid of varNameUlids) {

        // VAR_NAMEラインのparent_id 取得 ======
        const input_varNameParentIds = {
            tableId: tableId,
            tableType: 3,
            lineId: varNameUlid,
            column: 'parent_id',
        }
        const output_varNameParentIds = await RetrieveColumnAC(input_varNameParentIds)

        const input_varNameParentId = {
            rows: output_varNameParentIds.columns,
        }
        const output_varNameParentId = await FirstRowAC(input_varNameParentId)

        const varNameParentId = output_varNameParentId

        // 親のフィールドanchor =================
        const input_btnAnchorUlids = {
            tableId: tableId,
            tableType: 3,
            lineId: varNameParentId,
            nCat: NCat.ANCHOR,
            uCat: UCat.TAB,
        }
        const output_btnAnchorUlids = await SearchLineAC(input_btnAnchorUlids)

        const input_btnAnchorUlid = {
            rows: output_btnAnchorUlids.lineIds,
        }
        const output_btnAnchorUlid = await FirstRowAC(input_btnAnchorUlid)

        const btnAnchorUlid = output_btnAnchorUlid

        // anchorのdep_id取得 =================
        const input_btnAnchorDepIds = {
            tableId: tableId,
            tableType: 3,
            lineId: btnAnchorUlid,
            column: Column.DEP_ID,
        }
        const output_btnAnchorDepIds = await RetrieveColumnAC(input_btnAnchorDepIds)

        const input_btnAnchorDepId = {
            rows: output_btnAnchorDepIds.columns,
        }
        const output_btnAnchorDepId = await FirstRowAC(input_btnAnchorDepId)

        output.jointId = output_btnAnchorDepId?.[0]

        // 指定されたキーのライン取得 =================
        const input_fldLineUlids = {
            tableId: tableId,
            tableType: 3,
            parentId: btnAnchorUlid,
            key: Key.LABEL,
        }
        const output_fldLineUlids = await SearchLineAC(input_fldLineUlids)

        const input_fldLineUlid = {
            rows: output_fldLineUlids.lineIds,
        }
        const output_fldLineUlid = await FirstRowAC(input_fldLineUlid)

        // valueカラム取得
        const input_fldLineValues = {
            tableId: tableId,
            tableType: 3,
            lineId: output_fldLineUlid,
            column: Column.VALUE,
        }
        const output_fldLineValues = await RetrieveColumnAC(input_fldLineValues)

        const input_fldLineValue = {
            rows: output_fldLineValues.columns,
        }
        const output_fldLineValue = await FirstRowAC(input_fldLineValue)

        output.text = output_fldLineValue
    }


    const endTime = performance.now()
    console.log(`[GetTabWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetTabWFDef = {
    name: 'GetTabWF',
    scope: 'common',
    description: 'ラインのVAR_NAMEの値を起点に、セルの値を取得する'
}
