/**
 * BuildLayoutSnackingWF
 */

import type { ActivityFunction } from '~/types/activity'
import {
  BuildLayoutBlockRowAC,
  GetLayoutButtonConfigAC,
  GetLayoutSnackingConfigAC,
  PushRecordsAC,
  RetrieveTableAC,
  SearchNodeAC,
  GetLayoutKeyMapConfigAC,
  ReplaceLayoutKeyAC,
  PaddingLayoutBlockAC,
  ConvertScheduleToCalendarEventAC, AddFormDataStoreByOutputJsonAC, BuildLayoutCalendarJsonAC
} from '../activities'
import {
  BuildLayoutStructOldWF,
  BuildLayoutButtonWF,
  BuildLayoutBlockKeyWF,
} from './'
import {NCat} from "~/constants/NCat";
import {BuildLayoutActionWF} from "~/workflowDefs/common/workflows/BuildLayoutActionWF";

export type BuildLayoutSnackingWFPayload = {
  nodeIds: string

  configId: string
  snackingConfig?: any[]
  buttonConfig?: any[]
  keyMapConfig?: { [key: string]: string }
  ymd?: string
  mode?: 'month' | 'week' | 'day'
}

export type BuildLayoutSnackingWFResult = {
  layoutRows: any[]
}

export const BuildLayoutSnackingWF: ActivityFunction = async (
  payload: BuildLayoutSnackingWFPayload
): Promise<BuildLayoutSnackingWFResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutSnackingWF] 実行開始:', payload)

  const output: BuildLayoutSnackingWFResult = {
    layoutRows: []
  }

  // ==== 準備
  const _output_structTable = await RetrieveTableAC({
    tableId: 'button_structs'
  })
  await PushRecordsAC({
    tableId: 'button_structs',
    afterRows: { button_structs: _output_structTable.rows }
  })
  const _output_dataTable = await RetrieveTableAC({
    tableId: 'button_data'
  })
  await PushRecordsAC({
    tableId: 'button_data',
    afterRows: { button_structs: _output_dataTable.rows }
  })
  // ====

  // rootブロックキー作成
  const output_rootBuildLayoutAnchorKey = await BuildLayoutBlockKeyWF({
    parentKey: null,
    blockKey: 'root',
  })
  const output_buildBlockRow = await BuildLayoutBlockRowAC({
    blockKey: output_rootBuildLayoutAnchorKey.blockKey,
    instViewType: 'card',
    instEditType: 'card',
    tplViewType: 'card',
    tplEditType: 'card',
  })
  output.layoutRows.push(output_buildBlockRow.layoutRow)

  // つまみ食いコンフィグ取得
  let snackingConfigs: any[] = payload.snackingConfig || []
  if (!payload.snackingConfig) {
    const _output_snackingConfigAC = await GetLayoutSnackingConfigAC({
      configId: payload.configId,
    })
    snackingConfigs = _output_snackingConfigAC.configs
  }


  for (const nodeId of payload.nodeIds) {
    for (const config of snackingConfigs) {

      // ノード検索
      const _output_rootLineIds = await SearchNodeAC({
        searchType: config.searchType,
        nodeId: nodeId,
        edgeType: config.edgeType,
        nodeLabel: config.nodeLabel,
      })
      const output_buildLayoutStructWF = await BuildLayoutStructOldWF({
        // blockKey: blockKey,
        rows: _output_rootLineIds.nodeIds,

        anchorKey: config.anchorKey,
        lineKey: config.lineKey,
        column: config.column,
      })


      const _output_AddAnswerStoreByOutputJsonAC = await AddFormDataStoreByOutputJsonAC({
        layoutRows: output_buildLayoutStructWF.layoutRows,
        // containerId: null,
        // flowId: null,
      })


      const output_buildLayoutAnchorKey = await BuildLayoutBlockKeyWF({
        parentKey: output_rootBuildLayoutAnchorKey.blockKey,
        blockKey: nodeId,
      })
      let replaceKey: string | null = null

      if (payload.keyMapConfig) {
        replaceKey = payload.keyMapConfig[config.no] || null
      } else {
        const _output_getLayoutKeyMapConfigAC = await GetLayoutKeyMapConfigAC({
          no: config.no,
          configId: payload.configId,
        })
        replaceKey = _output_getLayoutKeyMapConfigAC.key
      }

      if (replaceKey) {
        const _output_replaceLayoutKeyAC = await ReplaceLayoutKeyAC({
          layoutRows: output_buildLayoutStructWF.layoutRows,
          prefixKey: output_buildLayoutAnchorKey.blockKey,
          replaceKey: replaceKey,
        })
        output.layoutRows.push(..._output_replaceLayoutKeyAC.layoutRows)
      }
    }
  }

console.log('output.layoutRows', output.layoutRows)

  switch (payload.configId) {
    case 'schedule':
      // ConvertScheduleToCalendarEventAC
      const _output_convertScheduleToCalendarEventAC = await ConvertScheduleToCalendarEventAC({
        layoutRows: output.layoutRows
      })
      output.layoutRows = _output_convertScheduleToCalendarEventAC.layoutRows

      const _output_layoutCalendarJsonAC = await BuildLayoutCalendarJsonAC({
        ymd: payload.ymd,
        mode: payload.mode
      })
      output.layoutRows.push(..._output_layoutCalendarJsonAC.layoutRows)
      break;

    case '':
      break;
  }


  // ==============================================
  // ボタンコンフィグ
  // const output_getButtonConfig = await GetLayoutButtonConfigAC({
  //   configId: payload.configId,
  // })
  // const layoutButtonConfig = output_getButtonConfig.configs
  //
  // // Todo
  // const layoutRows = JSON.parse(JSON.stringify(output.layoutRows))
  //
  // for (const conf of layoutButtonConfig) {
  //
  //   const _output_buildLayoutButtonWF = await BuildLayoutButtonWF({
  //     layoutRows: output.layoutRows,
  //     isRoot: conf.isRoot,
  //     viewType: conf.viewType,
  //     editType: conf.editType,
  //
  //     tableId: 'button_structs',
  //     nCat: NCat.ANCHOR,
  //     key: conf.buttonRootKey,
  //   })
  //
  //   output.layoutRows.push(..._output_buildLayoutButtonWF.layoutRows)
  // }
  const _output_BuildLayoutActionWF = await BuildLayoutActionWF({
    configId: payload.configId,
    layoutRows: output.layoutRows,
  })
  output.layoutRows.push(..._output_BuildLayoutActionWF.layoutRows)
  // ボタンコンフィグ
  let layoutButtonConfig: any[] = payload.buttonConfig || []
  if (!Array.isArray(layoutButtonConfig)) {
    layoutButtonConfig = [layoutButtonConfig]
  }

  if (!payload.buttonConfig) {
    const output_getButtonConfig = await GetLayoutButtonConfigAC({
      configId: payload.configId,
    })
    layoutButtonConfig = output_getButtonConfig.configs
  }

  // Todo
  const layoutRows = JSON.parse(JSON.stringify(output.layoutRows))

  for (const conf of layoutButtonConfig) {

    const _output_buildLayoutButtonWF = await BuildLayoutButtonWF({
      layoutRows: output.layoutRows,
      isRoot: conf.isRoot,
      viewType: conf.viewType,
      editType: conf.editType,

      tableId: 'button_structs',
      nCat: NCat.ANCHOR,
      key: conf.buttonRootKey,
    })

    output.layoutRows.push(..._output_buildLayoutButtonWF.layoutRows)
  }

  // cardブロックで埋める
  const _output_paddingLayoutBlockAC = await PaddingLayoutBlockAC({
    layoutRows: output.layoutRows
  })
  output.layoutRows.push(..._output_paddingLayoutBlockAC.layoutRows)


  const endTime = performance.now()
  console.log(`[BuildLayoutSnackingWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutSnackingWFDef = {
  name: 'BuildLayoutSnackingWF',
  scope: 'common',
  description: 'レイアウト構造を構築する'
}
