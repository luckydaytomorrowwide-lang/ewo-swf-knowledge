/**
 * MakeTemporaryWF Workflow
 * 
 * 指定された tableId と行データからテンポラリテーブルを作成する
 * 
 * Input:
 *   - tableId: ベースとなるテーブルID
 *   - rows: 登録する行データ
 * 
 * Output:
 *   - tempTableId: 生成されたテンポラリテーブルID
 */

import type { ActivityFunction } from '~/types/activity'
import { CreateUlidAC } from '../../common/activities/CreateUlidAC'
import { BuildTemporaryTableIdAC } from '../../common/activities/BuildTemporaryTableIdAC'
import { PushRecordsAC } from '../../common/activities/PushRecordsAC'

export interface MakeTemporaryWFPayload {
    tableId: string
    rows: any[]
}

export interface MakeTemporaryWFResult {
    tempTableId: string
}

export const MakeTemporaryWF: ActivityFunction = async (
    payload: MakeTemporaryWFPayload
): Promise<MakeTemporaryWFResult> => {
  const startTime = performance.now()
  console.log('[MakeTemporaryWF] 実行開始:', payload)

  // 1. CreateUlidAC: ULID生成
    const output_createUlid = await CreateUlidAC({})
    const ulid = output_createUlid.ulid

    // 2. BuildTemporaryTableIdAC: テンポラリテーブルID生成
    const input_buildTempTableId = {
        tableId: payload.tableId,
        ulid: ulid
    }
    const output_buildTempTableId = await BuildTemporaryTableIdAC(input_buildTempTableId)
    const tempTableId = output_buildTempTableId.tempTableId

    // 3. PushRecordsAC: レコードをプッシュ
    const input_pushRecords = {
        tableId: tempTableId,
        beforeRows: [],
        afterRows: payload.rows
    }
    await PushRecordsAC(input_pushRecords)

    const output: MakeTemporaryWFResult = {
        tempTableId: tempTableId
    }
    
    const endTime = performance.now()
    console.log(`[MakeTemporaryWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const MakeTemporaryWFDef = {
    name: 'MakeTemporaryWF',
    scope: 'common',
    description: '指定された tableId と行データからテンポラリテーブルを作成する'
}
