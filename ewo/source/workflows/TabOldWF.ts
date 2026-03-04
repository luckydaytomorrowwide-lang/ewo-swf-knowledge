/**
 * TabOldWF Activity
 *
 *
 */

import type { ActivityFunction } from '~/types/activity'
import {FirstRowAC, RetrieveColumnAC, SearchLineAC} from "../../common/activities";
import { ofetch } from 'ofetch'

export type TabOldWFPayload = {
    arg1: string
    arg2: string
}

export type TabOldWFResult = {
    nodeId: any
}

export const TabOldWF: ActivityFunction = async (
    payload: TabOldWFPayload
): Promise<TabOldWFResult> => {
  const startTime = performance.now()
  console.log('[TabOldWF] 実行開始:', payload)
    

    const nodeId = payload.arg1
    const label = payload.arg2

    
    const output: TabOldWFResult = { nodeId: null }

    // root anchor lineId ============================================================

    const postData: Record<string, any> = {
        workflow: 'TabOldWF',
        nodeId,
        label,
    }

    const response = await ofetch('http://localhost:8000/api/v1/workflow', {
        method: 'POST',
        body: postData
    })

    output.nodeId = response.result
    
    const endTime = performance.now()
    console.log(`[TabOldWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const TabOldWFDef = {
    name: 'TabOldWF',
    scope: 'common',
    description: ''
}
