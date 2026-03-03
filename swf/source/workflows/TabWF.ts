/**
 * TabWF Activity
 *
 *
 */

import type { ActivityFunction } from '~/types/activity'
import {FirstRowAC, RetrieveColumnAC, SearchLineAC} from "../../common/activities";
import { ofetch } from 'ofetch'

export type TabWFPayload = {
    arg1: string
    arg2: string
}

export type TabWFResult = {
    nodeId: any
}

export const TabWF: ActivityFunction = async (
    payload: TabWFPayload
): Promise<TabWFResult> => {
  const startTime = performance.now()
  console.log('[TabWF] 実行開始:', payload)

    const nodeId = payload.arg1
    const label = payload.arg2

    
    const output: TabWFResult = { nodeId: null }

    // root anchor lineId ============================================================

    const postData: Record<string, any> = {
        workflow: 'TabWF',
        nodeId,
        label,
    }

    const response = await ofetch('http://localhost:8000/api/v1/workflow', {
        method: 'POST',
        body: postData
    })

    output.nodeId = response.result
    
    const endTime = performance.now()
    console.log(`[TabWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const TabWFDef = {
    name: 'TabWF',
    scope: 'common',
    description: ''
}
