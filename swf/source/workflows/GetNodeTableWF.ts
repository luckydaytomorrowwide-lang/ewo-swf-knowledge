/**
 * GetNodeTableWF Activity
 *
 * URLからページULIDを取得して、ノードのdataプロパティからテーブルIDを取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {
    FirstRowAC,
    GetNodePropertyAC,
    SearchLineAC,
    CreateUlidAC,
    BuildTemporaryTableIdAC,
    RetrieveColumnAC,
    PushRecordsAC,
    GetNodeLabelsAC
} from "../../common/activities";

export type GetNodeTableWFPayload = {
    nodeId: string
}

export type GetNodeTableWFResult = {
    tableId: string | null
    firstBlockId: string | null
    nodeLabels: string[] | null
}

export const GetNodeTableWF: ActivityFunction = async (
    payload: GetNodeTableWFPayload
): Promise<GetNodeTableWFResult> => {
  const startTime = performance.now()
  console.log('[GetNodeTableWF] 実行開始:', payload)

  const output: GetNodeTableWFResult = { tableId: null, firstBlockId: null, nodeLabels: null }

    // pageUIdが引数として渡されていればそれを使用、なければURLから取得
    const nodeId = payload.nodeId

    // -----ノード検索

    const input_1_1 = {
        nodeId: nodeId,
    }
    const output_1_1 = await GetNodeLabelsAC(input_1_1)

    const nodeLabels = output_1_1.labels

    // --------------------------------- ノードDataプロパティから 格納テーブル名取得

    const input_2_1 = {
        nodeId: nodeId,
        property: 'data',
    }
    const output_2_1 = await GetNodePropertyAC(input_2_1)

    const input_2_2 = {}
    const output_2_2 = await CreateUlidAC(input_2_2)

    const input_2_3 = {
        tableId: 'data_property',
        ulid: output_2_2.ulid,
    }
    const output_2_3 = await BuildTemporaryTableIdAC(input_2_3)

    const input_2_4 = {
        tableId: output_2_3.tempTableId,
        afterRows: output_2_1.value
    }
    await PushRecordsAC(input_2_4)

    //

    const input_2_5 = {
        tableId: output_2_3.tempTableId,
        key: 'tableId',
    }
    const output_2_5 = await SearchLineAC(input_2_5)

    const input_2_6 = {
        rows: output_2_5.lineIds
    }
    const output_2_6 = await FirstRowAC(input_2_6)

    const input_2_7 = {
        tableId: output_2_3.tempTableId,
        lineId: output_2_6,
        column: 'value',
    }
    const output_2_7 = await RetrieveColumnAC(input_2_7)

    const input_2_8 = {
        rows: output_2_7.columns
    }
    const output_2_8 = await FirstRowAC(input_2_8)

    const structTableId = output_2_8

    //

    const input_2_9 = {
        tableId: output_2_3.tempTableId,
        key: 'firstBlockId',
    }
    const output_2_9 = await SearchLineAC(input_2_9)

    const input_2_10 = {
        rows: output_2_9.lineIds
    }
    const output_2_10 = await FirstRowAC(input_2_10)

    const input_2_11 = {
        tableId: output_2_3.tempTableId,
        lineId: output_2_10,
        column: 'value',
    }
    const output_2_11 = await RetrieveColumnAC(input_2_11)

    const input_2_12 = {
        rows: output_2_11.columns
    }
    const output_2_12 = await FirstRowAC(input_2_12)

    const firstBlockId = output_2_12


    output.tableId = structTableId
    output.firstBlockId = firstBlockId
    output.nodeLabels = nodeLabels


    const endTime = performance.now()
    console.log(`[GetNodeTableWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetNodeTableWFDef = {
    name: 'GetNodeTableWF',
    scope: 'common',
    description: 'URLからpageUIdを取得して、ノードに紐つく格納テーブルと地番テーブルを取得してPINIAに保存して、tableIdを返す'
}
