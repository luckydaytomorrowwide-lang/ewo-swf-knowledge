import { OpenPageConfigWF } from '~/workflowDefs/common/workflows/OpenPageConfigWF'
import type { WorkflowFunction } from '~/types/workflow'

// [Mock] Page Route Master
// 実運用ではRDBやCMSから取得する想定 (Columns: id, route_key, property)
const PAGE_ROUTE_MASTERS: Record<string, any> = {
    'jobseeker': {
        id: 1,
        route_key: 'jobseeker',
        property: {
            "varName": "pageInit",
            "label": "求職者管理",
            "icon": "",
            "value": "求職者管理",
            "display": "normal",
            "jointIds[]": "[table:cncf_masters|lineId:1|key:value]",
            "layoutMapConfigId": "table:layoutmap_config_masters|lineId:1|key:value",
            "snackingConfigIds": "table:snacking_config_masters|lineId:1|key:value",
            "buttonConfigId": "table:button_config_masters|lineId:1|key:value",
            "searchType": "1",
            "currentNodeId": null,
            "edgeType": "TREE_CONNECT",
            "nodeLabel": "求職者管理:instance",
            "row": null
        }
    },
    'baseinfo': {
        id: 2,
        route_key: 'baseinfo',
        property: {
            "varName": "pageInit",
            "label": "基本情報",
            "icon": "",
            "value": "基本情報",
            "display": "normal",
            "jointIds[]": "[table:cncf_masters|lineId:1|key:value]",
            "layoutMapConfigId": "table:layoutmap_config_masters|lineId:1|key:value",
            "snackingConfigIds": "table:snacking_config_masters|lineId:1|key:value",
            "buttonConfigId": "table:button_config_masters|lineId:1|key:value",
            "searchType": "1",
            "currentNodeId": null,
            "edgeType": "TREE_CONNECT",
            "nodeLabel": "基本情報:instance",
            "row": null
        }
    },
    'career': {
        id: 3,
        route_key: 'career',
        property: {
            "varName": "pageInit",
            "label": "経歴",
            "icon": "",
            "value": "経歴",
            "display": "normal",
            "jointIds[]": "[table:cncf_masters|lineId:1|key:value]",
            "layoutMapConfigId": "table:layoutmap_config_masters|lineId:1|key:value",
            "snackingConfigIds": "table:snacking_config_masters|lineId:1|key:value",
            "buttonConfigId": "table:button_config_masters|lineId:1|key:value",
            "searchType": "1",
            "currentNodeId": null,
            "edgeType": "TREE_CONNECT",
            "nodeLabel": "経歴:instance",
            "row": null
        }
    }
}

export interface InitPageWFPayload {
    routeKey: string // URL segment e.g. 'jobseeker'
    nodeId?: string  // URL param e.g. '123'
    [key: string]: any
}

export const InitPageWF: WorkflowFunction = async (payload: InitPageWFPayload) => {
    console.log('[InitPageWF] 実行開始', payload)

    const { routeKey, nodeId } = payload
    const master = PAGE_ROUTE_MASTERS[routeKey]

    if (!master) {
        console.warn(`[InitPageWF] Route Master not found for key: ${routeKey}`)
        // Fallback or Error handling
        return { success: false, message: 'Route Definition not found' }
    }

    console.log(`[InitPageWF] Master found for ${routeKey}`, master)

    // Masterのpropertyをそのまま使用 (URL nodeIdとの連携)
    const propertyObj = {
        ...master.property,
        currentNodeId: nodeId // URL paramから取得したnodeIdを注入
    }

    console.log('[InitPageWF] Generated Property:', propertyObj)

    // Delegate to OpenPageConfigWF using the generated property
    const result = await OpenPageConfigWF(propertyObj)

    return { success: true, config: propertyObj, ...result }
}

export const InitPageWFDef = {
    name: 'InitPageWF',
    description: 'URL情報からページ構成を初期化する',
    version: '1.0.0'
}
