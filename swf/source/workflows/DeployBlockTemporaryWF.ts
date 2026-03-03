/**
 * DeployBlockTemporaryWF Workflow
 * 
 * 指定された条件でブロックデータを取得し、
 * 指定のテーブルへのプッシュとテンポラリテーブルの作成を行う
 * 
 * Input:
 *   - tableId: 検索元テーブルID
 *   - lineId: アンカーlineId
 *   - depth: 深さ
 *   - type: タイプ
 * 
 * Output:
 *   - tempTableId: 生成されたテンポラリテーブルID
 */

import type { ActivityFunction } from '~/types/activity'
import {
    RetrieveBlockAC,
    PushRecordsAC
} from '~/workflowDefs/common/activities'
import { MakeTemporaryWF } from './MakeTemporaryWF'

export interface DeployBlockTemporaryWFPayload {
    tableId: string
    lineId: string
    depth: number
    type: string
}

export interface DeployBlockTemporaryWFResult {
    tempTableId: string
}

export const DeployBlockTemporaryWF: ActivityFunction = async (
    payload: DeployBlockTemporaryWFPayload
): Promise<DeployBlockTemporaryWFResult> => {
  const startTime = performance.now()
  console.log('[DeployBlockTemporaryWF] 実行開始:', payload)

  // 1. RetrieveBlockAC: ブロックデータを取得
    const input_retrieveBlock = {
        tableId: payload.tableId,
        lineId: payload.lineId,
        depth: payload.depth
        // type は RetrieveBlockACPayload には定義されていないが、必要に応じて利用
    }
    const output_retrieveBlock = await RetrieveBlockAC(input_retrieveBlock)

    // 2. PushRecordsAC: レコードをプッシュ
    const input_pushRecords = {
        tableId: payload.tableId,
        beforeRows: [],
        afterRows: output_retrieveBlock.rows
    }
    await PushRecordsAC(input_pushRecords)

    // 3. MakeTemporaryWF: テンポラリテーブル作成
    const input_makeTemporary = {
        tableId: payload.tableId,
        rows: output_retrieveBlock.rows
    }
    const output_makeTemporary = await MakeTemporaryWF(input_makeTemporary)
    const tempTableId = output_makeTemporary.tempTableId

    const output: DeployBlockTemporaryWFResult = {
        tempTableId: tempTableId
    }
    
    const endTime = performance.now()
    console.log(`[DeployBlockTemporaryWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const DeployBlockTemporaryWFDef = {
    name: 'DeployBlockTemporaryWF',
    scope: 'common',
    description: '指定された条件でブロックデータを取得し、指定のテーブルへのプッシュとテンポラリテーブルの作成を行う'
}
