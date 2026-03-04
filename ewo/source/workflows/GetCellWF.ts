/**
 * GetCellWF Activity (Jobseeker 専用)
 *
 * ラインのVAR_NAMEの値を起点に、セルの値を取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {FirstRowAC, RetrieveColumnAC, SearchLineAC} from "../../common/activities";
import {Key} from "../../../constants/Key";
import {NCat} from "../../../constants/NCat";
import {UCat} from "../../../constants/UCat";
import {Column} from "../../../constants/Column";

export type GetCellWFPayload = {
    arg1: string
    arg2: string
    arg3: string
    arg4: string
    arg5: string
}

export type GetCellWFResult = {
    text: any
}

export const GetCellWF: ActivityFunction = async (
    payload: GetCellWFPayload
): Promise<GetCellWFResult> => {
  const startTime = performance.now()
  console.log('[GetCellWF] 実行開始:', payload)

    const tableId = payload.arg1
    const varName = payload.arg2
    const parentUcat = payload.arg3
    const key = payload.arg4
    const column = payload.arg5
    
    const output: GetCellWFResult = { text: null }

    // root anchor lineId ============================================================

    const input_varNameUlids = {
        tableId: tableId,
        // tableType: 3,
        key: Key.VAR_NAME,
        value: varName,
    }
    const output_varNameUlids = await SearchLineAC(input_varNameUlids)

    const varNameUlids = output_varNameUlids.lineIds

    for (const varNameUlid of varNameUlids) {

        // VAR_NAMEラインのparent_id 取得 ======
        const input_varNameParentIds = {
            tableId: tableId,
            // tableType: 3,
            lineId: varNameUlid,
            column: Column.PARENT_ID,
        }
        const output_varNameParentIds = await RetrieveColumnAC(input_varNameParentIds)

        const input_varNameParentId = {
            rows: output_varNameParentIds.columns,
        }
        const output_varNameParentId = await FirstRowAC(input_varNameParentId)

        const varNameParentId = output_varNameParentId

        // 親のフィールドanchor =================
        const input_fldAnchorUlids = {
            tableId: tableId,
            // tableType: 3,
            lineId: varNameParentId,
            nCat: NCat.ANCHOR,
            uCat: parentUcat
        }
        const output_fldAnchorUlids = await SearchLineAC(input_fldAnchorUlids)

        const input_fldAnchorUlid = {
            rows: output_fldAnchorUlids.lineIds,
        }
        const output_fldAnchorUlid = await FirstRowAC(input_fldAnchorUlid)

        const fldAnchorUlid = output_fldAnchorUlid

        // 指定されたキーのライン取得 =================
        const input_fldLineUlids = {
            tableId: tableId,
            // tableType: 3,
            parentId: fldAnchorUlid,
            key: key,
        }
        const output_fldLineUlids = await SearchLineAC(input_fldLineUlids)

        const input_fldLineUlid = {
            rows: output_fldLineUlids.lineIds,
        }
        const output_fldLineUlid = await FirstRowAC(input_fldLineUlid)

        // valueカラム取得
        const input_fldLineValues = {
            tableId: tableId,
            // tableType: 3,
            lineId: output_fldLineUlid,
            column: column,
        }
        const output_fldLineValues = await RetrieveColumnAC(input_fldLineValues)

        const input_fldLineValue = {
            rows: output_fldLineValues.columns,
        }
        const output_fldLineValue = await FirstRowAC(input_fldLineValue)

        output.text = output_fldLineValue
    }
    
    const endTime = performance.now()
    console.log(`[GetCellWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetCellWFDef = {
    name: 'GetCellWF',
    scope: 'common',
    description: 'ラインのVAR_NAMEの値を起点に、セルの値を取得する'
}
