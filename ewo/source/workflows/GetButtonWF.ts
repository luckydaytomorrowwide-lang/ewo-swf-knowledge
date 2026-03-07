/**
 * GetButtonWF Activity (Jobseeker 専用)
 *
 * ラインのVAR_NAMEの値を起点に、セルの値を取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {Key} from "../../../constants/Key";
import {NCat} from "../../../constants/NCat";
import {UCat} from "../../../constants/UCat";
import {Column} from "../../../constants/Column";
import {FirstRowAC, RetrieveColumnAC, SearchLineAC, RetrieveTableAC, RegisterStructAC} from "../../common/activities";

export type GetButtonWFPayload = {
    arg1: string
    arg2: string
}

export type GetButtonWFResult = {
    text: any
    jointId: any
}

export const GetButtonWF: ActivityFunction = async (
    payload: GetButtonWFPayload
): Promise<GetButtonWFResult> => {
    const startTime = performance.now()
    console.log('[GetButtonWF] 実行開始:', payload)

    const tableId = payload.arg1
    const lineId = payload.arg2

    
    const output: GetButtonWFResult = { text: null, jointId: null }


    const _output_buttonAnchorLineIds = await SearchLineAC({
        tableId: tableId,
        uCat: 'button',
        parentId: lineId,
    })
    const _output_buttonAnchorLineId = await FirstRowAC({
        rows: _output_buttonAnchorLineIds.lineIds,
    })

    //
    const _output_buttonLabelLineIds = await SearchLineAC({
        tableId: tableId,
        key: 'label',
        parentId: _output_buttonAnchorLineId,
    })
    const _output_buttonLabelLineId = await FirstRowAC({
        rows: _output_buttonLabelLineIds.lineIds,
    })

    const _output_buttonLabelColumns = await RetrieveColumnAC({
        tableId: tableId,
        column: 'value',
        lineId: _output_buttonLabelLineId,
    })
    const _output_buttonLabelColumn = await FirstRowAC({
        rows: _output_buttonLabelColumns.columns,
    })

    output.text = _output_buttonLabelColumn

    //
    const _output_buttonJointLineIds = await SearchLineAC({
        tableId: tableId,
        key: 'jointId',
        parentId: _output_buttonAnchorLineId,
    })
    const _output_buttonJointLineId = await FirstRowAC({
        rows: _output_buttonJointLineIds.lineIds,
    })

    const _output_buttonJointColumns = await RetrieveColumnAC({
        tableId: tableId,
        column: 'value',
        lineId: _output_buttonJointLineId,
    })
    const _output_buttonJointColumn = await FirstRowAC({
        rows: _output_buttonJointColumns.columns,
    })

    output.jointId = _output_buttonJointColumn
    
    const endTime = performance.now()
    console.log(`[GetButtonWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetButtonWFDef = {
    name: 'GetButtonWF',
    scope: 'common',
    description: 'ラインのVAR_NAMEの値を起点に、セルの値を取得する'
}
