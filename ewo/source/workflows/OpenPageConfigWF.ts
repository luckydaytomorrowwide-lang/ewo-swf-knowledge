import { ParseCellRefAC, RetrieveColumnAC, FirstRowAC } from '~/workflowDefs/common/activities'
import { SetAnswerDataAC } from '~/workflowDefs/system/event-mediator/activities'
import type { WorkflowFunction } from '~/types/workflow'

export interface OpenPageConfigWFPayload {
    "jointIds[]"?: string;
    layoutMapConfigId?: string;
    snackingConfigIds?: string;
    buttonConfigId?: string;
    display?: string;
    searchType?: string;
    currentNodeId?: string | null;
    edgeType?: string;
    nodeLabel?: string;
    row?: any;
    [key: string]: any;
}

export const OpenPageConfigWF: WorkflowFunction = async (payload: OpenPageConfigWFPayload) => {
    console.log('[OpenPageConfigWF] 実行開始', payload)
    const results: any = {}

    // Helper function to process cell refs
    const loadAndSet = async (cellRefStr: string | undefined, outputKey: string, options: any = {}) => {
        if (!cellRefStr) return

        // Force type to 'page-config' (formerly source)
        // Map old 'type' in options to 'kind' if present?
        const { type: oldType, ...restOptions } = options
        const finalOptions = {
            ...restOptions,
            kind: oldType, // preserve old type as kind
            type: 'page-config'
        }
        if (!cellRefStr) return

        try {
            // 1. Parse Cell Ref (remove [] if present)
            const cleanRef = cellRefStr.replace('[', '').replace(']', '')
            const cellRef = await ParseCellRefAC({ cellRef: cleanRef })

            console.log(`[OpenPageConfigWF] Parsed CellRef:`, cellRef)

            // ParseCellRefAC returns table, lineId, key, and optionally tableId (if valid ULID)
            if (!cellRef || !cellRef.table || !cellRef.lineId || !cellRef.key) {
                console.warn(`[OpenPageConfigWF] Invalid cell ref: ${cellRefStr}`)
                return
            }

            // 2. Retrieve Column (returns array)
            // Use table name as tableId since it's a master table name (e.g. cncf_masters)
            // Use key as column name (e.g. value)
            const cols = await RetrieveColumnAC({
                tableId: cellRef.table,
                lineId: cellRef.lineId,
                column: cellRef.key
            })

            // 3. Get First Row
            const data = await FirstRowAC({ rows: cols.columns })

            if (data) {
                // 4. Set to AnswerStore
                await SetAnswerDataAC({
                    key: outputKey,
                    data: data,
                    options: finalOptions
                })
                results[outputKey] = true
                console.log(`[OpenPageConfigWF] Saved ${outputKey}`, data)
            }
        } catch (e) {
            console.error(`[OpenPageConfigWF] Error loading ${outputKey}:`, e)
        }
    }

    // 1. CNCF Workflow (jointIds[]) -> 'cncf'
    // Note: jointIds[] often comes as "[...]" string
    await loadAndSet(payload["jointIds[]"], 'cncf', { type: 'workflow', autoRun: true })

    // 2. Configs
    await loadAndSet(payload.layoutMapConfigId, 'layoutmap_config', { type: 'data' })
    await loadAndSet(payload.snackingConfigIds, 'snacking_config', { type: 'data' })
    await loadAndSet(payload.buttonConfigId, 'button_config', { type: 'data' })

    // 3. Display Setting
    if (payload.display) {
        await SetAnswerDataAC({
            key: 'display',
            data: payload.display,
            options: { kind: 'data', type: 'page-config' }
        })
    }

    // 4. Search Node Setting
    const searchNodeData = {
        searchType: payload.searchType,
        currentNodeId: payload.currentNodeId,
        edgeType: payload.edgeType,
        nodeLabel: payload.nodeLabel,
        row: payload.row
    }

    await SetAnswerDataAC({
        key: 'search_node',
        data: searchNodeData,
        options: { kind: 'data', type: 'page-config' }
    })

    console.log('[OpenPageConfigWF] 完了', results)
    return results
}

export const OpenPageConfigWFDef = {
    name: 'OpenPageConfigWF',
    description: 'ページ/コンテキスト設定ロード: プロパティから各種マスタデータをロードしStoreに展開する',
    version: '1.0.0'
}
