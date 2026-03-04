/**
 * CreateInstanceWF Activity
 *
 *
 */

import type { ActivityFunction } from '~/types/activity'
import { ofetch } from 'ofetch'

export type CreateInstanceWFPayload = {
    nodeLabels?: string | null
    nodeId: string | null
}

export type CreateInstanceWFResult = {
    nodeId: string
    tableId: string
    rootLineId: string
}

export const CreateInstanceWF: ActivityFunction = async (
    payload: CreateInstanceWFPayload
): Promise<CreateInstanceWFResult> => {
  const startTime = performance.now()
  console.log('[CreateInstanceWF] 実行開始:', payload)

    // root anchor lineId ============================================================

    const postData: Record<string, any> = {
        workflow: 'CreateInstanceWF',
        nodeLabels: payload?.nodeLabels,
        nodeId: payload.nodeId,
    }

    const response = await ofetch('http://localhost:8000/api/v1/workflow', {
        method: 'POST',
        body: postData
    })

    const output = {
        nodeId: response.result.nodeId,
        tableId: response.result.tableId,
        rootLineId: response.result.rootLineId
    }

    const endTime = performance.now()
    console.log(`[CreateInstanceWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const CreateInstanceWFDef = {
    name: 'CreateInstanceWF',
    scope: 'common',
    description: ''
}
