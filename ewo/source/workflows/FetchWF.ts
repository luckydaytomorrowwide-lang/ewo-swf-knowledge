/**
 * FetchWF Activity (Jobseeker 専用)
 *
 * 指定されたラベルでノードを検索して、無ければ作成してnodeIdを返す
 */

import type { ActivityFunction } from '~/types/activity'
import {
    CreateEdgeAC,
    CreateInstanceAC,
    FirstRowAC,
    GetPageIdAC,
    RetrieveColumnAC,
    SearchLineAC,
    SearchNodeAC
} from "../../common/activities";
import { Label } from '~/constants/Label'
import { Edge } from '~/constants/Edge'

export type FetchWFPayload = {
    arg1: string
}

export type FetchWFResult = {
    nodeId: string
}

export const FetchWF: ActivityFunction = async (
    payload: FetchWFPayload
): Promise<FetchWFResult> => {
  const startTime = performance.now()
  console.log('[FetchWF] 実行開始:', payload)

    const nodeLabel = payload.arg1

    
    const output: FetchWFResult = { nodeId: null }

    const output_pageId = await GetPageIdAC()

    const input_baseinfoListNodes = {
        searchType: 2,
        nodeId: output_pageId,
        edgeType: Edge.TREE_CONNECT,
        nodeLabel: [Label.INSTANCE, nodeLabel],
    }
    const output_baseinfoListNodes = await SearchNodeAC(input_baseinfoListNodes)

    if (output_baseinfoListNodes.nodeIds.length === 0) {

        // テンプレートノード検索
        const input_baseinfoTemplateNodes = {
            searchType: 3,
            nodeId: output_pageId,
            nodeLabel: [Label.TEMPLATE, nodeLabel],
        }
        const output_baseinfoTemplateNodes = await SearchNodeAC(input_baseinfoTemplateNodes)

        const input_baseinfoTemplateNode = {
            rows: output_baseinfoTemplateNodes.nodeIds,
        }
        const output_baseinfoTemplateNode = await FirstRowAC(input_baseinfoTemplateNode)

        // インスタンス作成
        const input_createInstance = {
            nodeId: output_baseinfoTemplateNode,
        }
        const output_createInstance = await CreateInstanceAC(input_createInstance)

        // エッジ作成
        const input_createEdge = {
            sourceNodeId: output_pageId,
            targetNodeId: output_createInstance.nodeId,
            edgeType: Edge.TREE_CONNECT,
        }
        const output_createEdge = await CreateEdgeAC(input_createEdge)

        output.nodeId = output_createInstance.nodeId
    }
    else {

        // １件
        const input_baseinfoListNode = {
            rows: output_baseinfoListNodes.nodeIds,
        }
        const output_baseinfoListNode = await FirstRowAC(input_baseinfoListNode)

        const baseinfoListNodeId = output_baseinfoListNode

        output.nodeId = baseinfoListNodeId
    }

    const endTime = performance.now()
    console.log(`[FetchWF] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const FetchWFDef = {
    name: 'FetchWF',
    scope: 'common',
    description: '指定されたラベルでノードを検索して、無ければ作成してnodeIdを返す'
}
