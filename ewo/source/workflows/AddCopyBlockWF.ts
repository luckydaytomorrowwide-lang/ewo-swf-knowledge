/**
 * AddCopyBlockWF Workflow
 * 
 * 指定されたアンカー配下にマスターブロックの構造とデータをコピーして追加する。
 * バックエンドの AddCopyBlockWF.php を呼び出します。
 * 
 * Input:
 *   - targetTableId: string (構造テーブルID)
 *   - sourceTableId: string (コピー元テーブルID)
 *   - sourceLineId: string (コピー元ラインID)
 *   - parentLineId: string (追加先の親ラインID)
 *   - depth: number (階層の深さ)
 * 
 * Output:
 *   - rootLineId: string (作成されたルートラインID)
 */

import type { ActivityFunction } from '~/types/activity'
import { ofetch } from 'ofetch'

export interface AddCopyBlockWFPayload {
  targetTableId: string
  sourceTableId: string
  sourceLineId: string
  parentLineId: string
  depth?: number
}

export interface AddCopyBlockWFResult {
  rootLineId: string
}

export const AddCopyBlockWF: ActivityFunction = async (
  payload: AddCopyBlockWFPayload
): Promise<AddCopyBlockWFResult> => {
  const startTime = performance.now()
  console.log('[AddCopyBlockWF] 実行開始:', payload)

  // バックエンド API 呼び出し
  const response = await ofetch('http://localhost:8000/api/v1/workflow', {
    method: 'POST',
    body: {
      workflow: 'AddCopyBlockWF',
      ...payload
    }
  })

  if (!response.result) {
    console.error('[AddCopyBlockWF] API Error:', response)
    throw new Error('Failed to execute AddCopyBlockWF')
  }

  const output: AddCopyBlockWFResult = {
    rootLineId: response.result.rootLineId
  }

  const endTime = performance.now()
  console.log(`[AddCopyBlockWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const AddCopyBlockWFDef = {
  name: 'AddCopyBlockWF',
  scope: 'common',
  description: 'マスターブロックをコピーして追加する'
}
