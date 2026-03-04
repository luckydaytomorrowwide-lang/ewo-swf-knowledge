/**
 * BuildSnackingLayoutMapWF
 * 
 * Snacking Layoutの構築からMap変換、パッチ適用までを一貫して行う統合ワークフロー
 * 
 * 1. BuildLayoutSnackingWF (構造構築)
 * 2. ConvertLayoutRowsToMapAC (Map変換)
 * 3. PatchLayoutMapAC (パッチ適用)
 */

import type { ActivityFunction } from '~/types/activity'
import {
    ConvertLayoutRowsToMapAC,
    PatchLayoutMapAC
} from '../activities'
import {
    BuildLayoutSnackingWF
} from './'

export type BuildSnackingLayoutMapWFPayload = {
    nodeIds: string
    configId: string
    snackingConfig?: any[]
    buttonConfig?: any[]
    keyMapConfig?: { [key: string]: string }
}

export type BuildSnackingLayoutMapWFResult = {
    layoutMapData: Record<string, any>
}

export const BuildSnackingLayoutMapWF: ActivityFunction = async (
    payload: BuildSnackingLayoutMapWFPayload
): Promise<BuildSnackingLayoutMapWFResult> => {
    const startTime = performance.now()
    console.log('[BuildSnackingLayoutMapWF] 実行開始', payload)

    // 1. Build Layout (Rows)
    // 既存のWFを再利用 (内部で ConstructLayoutTreeWF を使うようにあとで改修が必要だが、
    // 今はまだ BuildLayoutStructOldWF を使っているかもしれない。後で差し替える)
    const buildResult = await BuildLayoutSnackingWF({
        nodeIds: payload.nodeIds,
        configId: payload.configId,
        snackingConfig: payload.snackingConfig,
        buttonConfig: payload.buttonConfig,
        keyMapConfig: payload.keyMapConfig
    })

    // 2. Convert to Map
    const convertResult = await ConvertLayoutRowsToMapAC({
        layoutRows: buildResult.layoutRows
    })

    // 3. Patch Map
    const patchResult = await PatchLayoutMapAC({
        layoutMapData: convertResult.layoutMapData
    })

    const endTime = performance.now()
    console.log(`[BuildSnackingLayoutMapWF] 完了 (${(endTime - startTime).toFixed(3)}ms)`)

    return {
        layoutMapData: patchResult.layoutMapData
    }
}

export const BuildSnackingLayoutMapWFDef = {
    name: 'BuildSnackingLayoutMapWF',
    scope: 'common',
    description: 'Snacking LayoutのMapデータを構築する'
}
