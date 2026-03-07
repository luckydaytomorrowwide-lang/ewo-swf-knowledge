/**
 * AddBlockWF Workflow
 * 
 * 指定されたテーブルからブロック構造を取得し、対象のテーブルに追加する。
 * バックエンドの AddBlockWF.php を呼び出します。
 * 
 * Input:
 *   - targetTableId: string (追加先の構造テーブルID)
 *   - targetParentId: string (追加先の親ラインID, 任意)
 *   - sourceTableId: string (取得元の構造テーブルID)
 *   - sourceLineId: string (取得元のラインID)
 *   - depth: number (階層の深さ, 任意)
 * 
 * Output:
 *   - affectedStructRowsCount: number (追加された構造行数)
 *   - affectedDataRowsCount: number (追加されたデータ行数)
 */

import type { ActivityFunction } from '~/types/activity'
import { ofetch } from 'ofetch'

export type AddBlockWFPayload = {
    targetTableId: string
    targetParentId?: string
    sourceTableId: string
    sourceLineId: string
    depth?: number
}

export type AddBlockWFResult = {
    affectedStructRowsCount: number
    affectedDataRowsCount: number
}

export const AddBlockWF: ActivityFunction = async (
    payload: AddBlockWFPayload
): Promise<AddBlockWFResult> => {
    const startTime = performance.now()
    console.log('[AddBlockWF] 実行開始:', payload)

    // 1. バックエンドのWorkflowを実行
    const response = await ofetch('http://localhost:8000/api/v1/workflow', {
        method: 'POST',
        body: {
            workflow: 'AddBlockWF',
            ...payload
        }
    })

    if (!response.result) {
        console.error('[AddBlockWF] API Error:', response)
        throw new Error('Failed to execute AddBlockWF')
    }

    const output: AddBlockWFResult = {
        affectedStructRowsCount: response.result.affectedStructRowsCount,
        affectedDataRowsCount: response.result.affectedDataRowsCount
    }

    const endTime = performance.now()
    console.log(`[AddBlockWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const AddBlockWFDef = {
    name: 'AddBlockWF',
    scope: 'common',
    description: 'ブロック構造を別のテーブルに追加する'
}
