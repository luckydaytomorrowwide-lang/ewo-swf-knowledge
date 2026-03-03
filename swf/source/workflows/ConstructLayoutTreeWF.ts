/**
 * ConstructLayoutTreeWF
 * (Formerly BuildLayoutStructOldWF)
 */

import type { ActivityFunction } from '~/types/activity'
import {
    DeployBlockWF,
    BuildLayoutBlockKeyWF,
    BuildLayoutBlockWF,
    BuildLayoutBlockRowWF,
    GetNodeTableWF
} from './'

export type ConstructLayoutTreeWFPayload = {
    blockKey: string
    rows: any[]

    anchorKey?: string,
    lineKey?: string,
    column?: string,
}

export type ConstructLayoutTreeWFResult = {
    layoutRows: any[]
}

export const ConstructLayoutTreeWF: ActivityFunction = async (
    payload: ConstructLayoutTreeWFPayload
): Promise<ConstructLayoutTreeWFResult> => {
    const startTime = performance.now()
    console.log('[ConstructLayoutTreeWF] 実行開始:', payload)

    const output: ConstructLayoutTreeWFResult = {
        layoutRows: []
    }

    for (const row of payload.rows) {
        const nodeId = row

        // 1. GetNodeTableWF
        const output_getNodeTable = await GetNodeTableWF({
            nodeId: nodeId
        })
        const firstBlockId = output_getNodeTable.firstBlockId
        const tableId = output_getNodeTable.tableId

        // 2. DeployBlockWF
        // depth, type defaults inferred from original code
        const output_deployBlock = await DeployBlockWF({
            tableId: tableId,
            lineId: firstBlockId,
            depth: 10,
            type: 'default'
        })
        const tempTableId = output_deployBlock.tempTableId

        let blockKey = null;

        if (!payload?.anchorKey) {
            // 3. BuildLayoutAnchorKeyWF
            const output_buildLayoutAnchorKey = await BuildLayoutBlockKeyWF({
                parentKey: payload.blockKey,
                blockKey: firstBlockId
            })
            blockKey = output_buildLayoutAnchorKey.blockKey

            const output_buildLayoutBlockRowWF = await BuildLayoutBlockRowWF({
                tableId: tempTableId,
                lineId: firstBlockId,

                blockKey: blockKey,
                viewType: 'card',
                editType: 'card',

                label: null,
                value: null,
                jointId: null,
            })

            output.layoutRows.push(output_buildLayoutBlockRowWF.layoutRow)
        }

        // BuildLayoutBlockWF
        const output_buildLayoutBlock = await BuildLayoutBlockWF({
            tableId: tempTableId,
            blockKey: blockKey,
            anchorId: firstBlockId,

            anchorKey: payload.anchorKey,
            lineKey: payload.lineKey,
            column: payload.column,
        })

        output.layoutRows.push(...output_buildLayoutBlock.layoutRows)
    }

    const endTime = performance.now()
    console.log(`[ConstructLayoutTreeWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const ConstructLayoutTreeWFDef = {
    name: 'ConstructLayoutTreeWF',
    scope: 'common',
    description: 'レイアウト構造を構築する(Construct Layout Tree)'
}
