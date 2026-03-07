import { ParseCellRefAC, RetrieveColumnAC, FirstRowAC } from '~/workflowDefs/common/activities'
import { SetAnswerDataAC } from '~/workflowDefs/system/event-mediator/activities'

export interface RunButtonActionWFPayload {
    jointId?: string
    label?: string
    data?: any // Button payload (containing properties)
    [key: string]: any
}

export const RunButtonActionWF = async (payload: RunButtonActionWFPayload) => {
    console.log('[RunButtonActionWF] Started', payload)

    const buttonData = payload.data || {}
    const jointIds = buttonData["jointIds[]"]

    if (!jointIds) {
        console.warn('[RunButtonActionWF] No jointIds[] found in button data', buttonData)
        return { success: false, message: 'No jointIds[] found' }
    }

    try {
        // 1. Parse Cell Ref (expecting array string like "[table:cncf_masters|...]")
        const cellRefStr = jointIds.replace('[', '').replace(']', '')
        const cellRef = await ParseCellRefAC({ cellRef: cellRefStr })

        if (!cellRef || !cellRef.table || !cellRef.lineId || !cellRef.key) {
            console.warn(`[RunButtonActionWF] Invalid cell ref: ${cellRefStr}`)
            return { success: false, message: 'Invalid cell ref' }
        }

        // 2. Retrieve CNCF JSON from Master Table
        // Use key as column name (e.g. value)
        const cols = await RetrieveColumnAC({
            tableId: cellRef.table,
            lineId: cellRef.lineId,
            column: cellRef.key
        })

        const cncfJson = await FirstRowAC({ rows: cols.columns })

        if (!cncfJson) {
            console.warn(`[RunButtonActionWF] CNCF JSON not found for ${cellRefStr}`)
            return { success: false, message: 'CNCF JSON not found' }
        }

        console.log('[RunButtonActionWF] CNCF JSON loaded:', cncfJson)

        // 3. Trigger Workflow Execution via AnswerStore
        // Input: Button payload (properties)
        const runKey = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

        await SetAnswerDataAC({
            key: runKey,
            data: cncfJson,
            options: {
                type: 'workflow',
                autoRun: true,
                input: buttonData // Pass all button properties as workflow input
            }
        })

        console.log(`[RunButtonActionWF] Workflow triggered: ${runKey}`)
        return { success: true, runKey }

    } catch (e) {
        console.error('[RunButtonActionWF] Error:', e)
        return { success: false, error: e }
    }
}

export const RunButtonActionWFDef = {
    name: 'RunButtonActionWF',
    description: 'ボタンクリックからプロパティを抽出し、CNCFワークフローを動的実行する',
    version: '1.0.0'
}
