/**
 * GetPageTableWF Activity
 *
 * URLからページULIDを取得して、ノードのdataプロパティからテーブルIDを取得する
 */

import type { ActivityFunction } from '~/types/activity'
import {
    FirstRowAC,
    GetPageIdAC,
    MergeTableAC,
    RegisterDataAC,
    RegisterStructAC,
    RegisterTemporaryAC,
    RetrieveTableAC,
    GetNodePropertyAC,
    SearchNodeAC,
    SearchLineAC,
    CreateUlidAC, 
    BuildTemporaryTableIdAC, 
    RetrieveColumnAC,
    ConvertStructToDataTableNameAC,
} from "../../common/activities";
import type {SearchLineACResult} from "../../common/activities/SearchLineAC";

export type GetPageTableWFPayload = {
    pageId?: string  // オプショナルな引数として追加
}

export type GetPageTableWFResult = {
    tableId: string
}

export const GetPageTableWF: ActivityFunction = async (
    payload: GetPageTableWFPayload = {}
): Promise<GetPageTableWFResult> => {
  const startTime = performance.now()
  console.log('[GetPageTableWF] 実行開始:', payload)

    const output: GetPageTableWFResult = { tableId: null }

    // pageUIdが引数として渡されていればそれを使用、なければURLから取得
    let pageId: string
    if (payload.pageId) {
        console.log('[GetPageTableWF] 引数からpageUIdを使用:', payload.pageId)
        pageId = payload.pageId.toLowerCase()
    } else {
        console.log('[GetPageTableWF] URLからpageUIdを取得')
        const output_0 = await GetPageIdAC()
        pageId = output_0.toLowerCase()
    }

    // ----- 人材01ノード検索

    const input_1_1 = {
        nodeId: pageId,
    }
    const output_1_1 = await SearchNodeAC(input_1_1)

    const input_1_2 = {
        rows: output_1_1.nodeIds,
    }
    const output_1_2 = await FirstRowAC(input_1_2)

    const nodeId = output_1_2

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
        rows: output_2_1.value
    }
    const output_2_4 = await RegisterTemporaryAC(input_2_4)

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

    // ----- 格納テーブルJSON取得して、PINIAに保存

    const input_3_1 = {
        tableId: structTableId,
    }
    const output_3_1 = await RetrieveTableAC(input_3_1)

    const input_3_2 = {
        rows: output_3_1.rows,
    }
    const output_3_2 = await RegisterStructAC(input_3_2)

    // --------------------------------- ノードDataプロパティから 地番テーブル名取得

    const input_4_1 = {
        tableId: structTableId
    }
    const output_4_1 = await ConvertStructToDataTableNameAC(input_4_1)

    const dataTableId = output_4_1.tableId

    // ----- 地番テーブルJSON取得して、PINIAに保存

    const input_5_1 = {
        tableId: dataTableId,
    }
    const output_5_1 = await RetrieveTableAC(input_5_1)

    const input_5_2 = {
        rows: output_5_1.rows,
    }
    const output_5_2 = await RegisterDataAC(input_5_2)

    // --------------------------- 格納テーブル名からテンポラリテーブル名取得

    const input_6 = {
        tableId: structTableId,
        // ulid: output_2_2.ulid,
    }
    const output_6 = await BuildTemporaryTableIdAC(input_6)

    // --------------------------- テーブルULIDでテンポラリ（展開）テーブル作成

    const input_7 = {
        structTableId: structTableId,
        dataTableId: dataTableId,
    }
    const output_7 = await MergeTableAC(input_7)

    const input_8 = {
        tableId: output_6.tableId,
        rows: output_7.rows,
    }
    await RegisterTemporaryAC(input_8)

    output.tableId = output_6.tableId

    const endTime = performance.now()
    console.log(`[GetPageTableWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const GetPageTableWFDef = {
    name: 'GetPageTableWF',
    scope: 'common',
    description: 'URLからpageUIdを取得して、ノードに紐つく格納テーブルと地番テーブルを取得してPINIAに保存して、tableIdを返す'
}
