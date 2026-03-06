/**
 * DeployBlockWF Workflow
 * 
 * 指定された条件でブロックデータを展開し、マージした結果をテンポラリテーブルに登録する
 * 
 * Input:
 *   - tableId: 構造テーブルID (例: career_structs)
 *   - lineId: アンカーlineId
 *   - depth: 深さ
 *   - type: タイプ
 *   - ulid: テンポラリテーブル生成用ULID
 * 
 * Output:
 *   - tempTableId: 生成されたテンポラリテーブルID
 *   - affectedRowsCount: 影響した行数
 */

import type { ActivityFunction } from '~/types/activity'
import {
    ConvertStructToDataTableNameAC,
    MergeTableAC,
    BuildTemporaryTableIdAC,
    PushRecordsAC
} from '../../common/activities'
import {
    DeployBlockTemporaryWF
} from '../../common/workflows'


export interface DeployBlockWFPayload {
    tableId: string
    lineId: string
    depth: number
    type: string
}

export interface DeployBlockWFResult {
    tempTableId: string
}

export const DeployBlockWF: ActivityFunction = async (
    payload: DeployBlockWFPayload
): Promise<DeployBlockWFResult> => {
  const startTime = performance.now()
  console.log('[DeployBlockWF] 実行開始:', payload)

  // 1. ConvertStructToDataTableNameAC: 地番テーブル名取得 (struct -> data)
    const output_convert = await ConvertStructToDataTableNameAC({ tableId: payload.tableId })
    const dataTableId = output_convert.tableId

    // 2. リトリーブブロック (DeployBlockTemporaryWF) - 構造側
    const output_deployTempStruct = await DeployBlockTemporaryWF({
        tableId: payload.tableId,
        lineId: payload.lineId,
        depth: payload.depth,
        type: payload.type
    })
    const structTempTableId = output_deployTempStruct.tempTableId

    // 3. リトリーブブロック (DeployBlockTemporaryWF) - データ側
    const output_deployTempData = await DeployBlockTemporaryWF({
        tableId: dataTableId,
        lineId: payload.lineId,
        depth: payload.depth,
        type: payload.type
    })
    const dataTempTableId = output_deployTempData.tempTableId

    // 4. MergeTableAC: 格納と地番をマージ
    const output_merge = await MergeTableAC({
        structTableId: structTempTableId,
        dataTableId: dataTempTableId
    })
    const rows = output_merge.rows

    // 5. BuildTemporaryTableIdAC: テンポラリテーブルID生成
    const output_buildId = await BuildTemporaryTableIdAC({
        tableId: payload.tableId.replace(/_structs?/g, '_deploy'), // Todo
        ulid: payload.lineId
    })
    const tempTableId = output_buildId.tempTableId

    // 6. PushRecordsAC: テンポラリテーブル作成（プッシュ）
    const input_pushRecords = {
        tableId: tempTableId,
        beforeRows: [],
        afterRows: rows
    }
    await PushRecordsAC(input_pushRecords)

    const output: DeployBlockWFResult = {
        tempTableId: tempTableId
    }


    const endTime = performance.now()
    console.log(`[DeployBlockWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const DeployBlockWFDef = {
    name: 'DeployBlockWF',
    scope: 'common',
    description: '指定された条件でブロックデータを展開し、マージした結果をテンポラリテーブルに登録する'
}
