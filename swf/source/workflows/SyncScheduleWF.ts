/**
 * SyncScheduleWF Activity
 */

import type { ActivityFunction } from '~/types/activity'
import { ofetch } from 'ofetch'

export type SyncScheduleWFPayload = {
    topicNodeId: string | null
    scheduleNodeId?: string | null
    kind?: string | null
    timeRange?: string | null
    comment?: string | null
}

export type SyncScheduleWFResult = {
    nodeId: string
    tableId: string
    rootLineId: string
}

export const SyncScheduleWF: ActivityFunction = async (
    payload: SyncScheduleWFPayload
): Promise<SyncScheduleWFResult> => {
  const startTime = performance.now()
  console.log('[SyncScheduleWF] 実行開始:', payload)

    const postData: Record<string, any> = {
        workflow: 'SyncScheduleWF',
        topicNodeId: payload.topicNodeId,
        scheduleNodeId: payload?.scheduleNodeId,
        kind: payload?.kind,
        timeRange: payload?.timeRange,
        comment: payload?.comment,
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
    console.log(`[SyncScheduleWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const SyncScheduleWFDef = {
    name: 'SyncScheduleWF',
    scope: 'common',
    description: ''
}
