/**
 * BuildLayoutAnchorKeyWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  CreateLayoutBlockKeyAC,
  ConcatStringAC,
} from "../../common/activities";

export type BuildLayoutAnchorKeyWFPayload = {
  parentKey: string | null
  blockKey: string
}

export type BuildLayoutAnchorKeyWFResult = {
  blockKey: string
}

export const BuildLayoutBlockKeyWF: ActivityFunction = async (
  payload: BuildLayoutAnchorKeyWFPayload
): Promise<BuildLayoutAnchorKeyWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockKeyWF] 実行開始:', payload)

  // BlockKey生成
  const output_createLayoutBlockKey = await CreateLayoutBlockKeyAC({
    name: 'block',
    key: payload.blockKey
  })

  // 文字列連結
  const output_concatString = await ConcatStringAC({
    srcStr: payload.parentKey,
    separator: '.',
    destStr: output_createLayoutBlockKey.str
  })

  const output: BuildLayoutAnchorKeyWFResult = {
    blockKey: output_concatString.str
  }
  
  const endTime = performance.now()
  console.log(`[BuildLayoutBlockKeyWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutAnchorKeyWFDef = {
  name: 'BuildLayoutAnchorKeyWF',
  scope: 'common',
  description: 'レイアウトアンカーを出力する'
}
