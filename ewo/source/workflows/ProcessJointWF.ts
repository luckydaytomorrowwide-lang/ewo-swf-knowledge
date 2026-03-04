import type { WorkflowDefinition } from '~/types/workflow'

// Define the workflow that orchestrates the joint processing
export const ProcessJointWF: WorkflowDefinition = {
    id: 'process-joint-wf',
    version: '1.0.0',
    specVersion: '0.8',
    name: 'Process Joint Input Workflow',
    start: 'ParseInput',
    states: [
        {
            name: 'ParseInput',
            type: 'operation',
            actions: [
                {
                    name: 'parseStructure',
                    functionRef: {
                        refName: 'processJointInput',
                        arguments: {
                            input: '${ . }' // Pass the whole input
                        }
                    },
                    actionDataFilter: {
                        toStateData: 'parsed'
                    }
                }
            ],
            transition: 'ProcessEachJoint'
        },
        {
            name: 'ProcessEachJoint',
            type: 'foreach',
            inputCollection: '${ .parsed.joints }',
            iterationParam: 'joint',
            actions: [
                {
                    name: 'fetchCncf',
                    functionRef: {
                        refName: 'fetchCncf',
                        arguments: {
                            jointId: '${ .joint.jointId }'
                        }
                    },
                    actionDataFilter: {
                        toStateData: 'cncfResult'
                    }
                },
                {
                    name: 'mergeInput',
                    functionRef: {
                        refName: 'mergeInput',
                        arguments: {
                            property: '${ .parsed.property }',
                            joint: '${ .joint }',
                            cncf: '${ .cncfResult.cncf }'
                        }
                    },
                    actionDataFilter: {
                        toStateData: 'merged'
                    }
                },
                {
                    name: 'saveToStore',
                    functionRef: {
                        refName: 'saveToAnswerStore',
                        arguments: {
                            cncf: '${ .merged.cncf }',
                            input: '${ .merged.input }'
                        }
                    },
                    actionDataFilter: {
                        toStateData: 'saved'
                    }
                }
            ],
            end: true
        }
    ],
    functions: [
        {
            name: 'processJointInput',
            type: 'custom',
            operation: 'custom:ProcessJointInputActivity'
        },
        {
            name: 'fetchCncf',
            type: 'custom',
            operation: 'custom:FetchCncfActivity'
        },
        {
            name: 'mergeInput',
            type: 'custom',
            operation: 'custom:MergeInputActivity'
        },
        {
            name: 'saveToAnswerStore',
            type: 'custom',
            operation: 'custom:SaveToAnswerStoreActivity'
        }
    ]
}
