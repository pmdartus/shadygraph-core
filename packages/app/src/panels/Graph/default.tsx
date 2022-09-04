import { Node, Edge } from 'react-flow-renderer';

export const defaultNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: {
            label: (
                <>
                    Welcome to <strong>React Flow!</strong>
                </>
            ),
        },
        position: { x: 250, y: 0 },
    },
    {
        id: '2',
        data: {
            label: (
                <>
                    This is a <strong>default node</strong>
                </>
            ),
        },
        position: { x: 100, y: 100 },
    },
    {
        id: '3',
        data: {
            label: (
                <>
                    This one has a <strong>custom style</strong>
                </>
            ),
        },
        position: { x: 400, y: 100 },
        style: {
            background: '#D6D5E6',
            color: '#333',
            border: '1px solid #222138',
            width: 180,
        },
    },
    {
        id: '4',
        position: { x: 250, y: 200 },
        data: {
            label: 'Another default node',
        },
    },
    {
        id: '5',
        data: {
            label: 'Node id: 5',
        },
        position: { x: 250, y: 325 },
    },
    {
        id: '6',
        type: 'output',
        data: {
            label: (
                <>
                    An <strong>output node</strong>
                </>
            ),
        },
        position: { x: 100, y: 480 },
    },
    {
        id: '7',
        type: 'output',
        data: { label: 'Another output node' },
        position: { x: 400, y: 450 },
    },
    {
        id: '8',
        type: 'shader',
        data: {
            label: 'Another output node',
            inputs: [{ id: 'input1', label: 'Input 1' }],
            outputs: [
                { id: 'output1', label: 'Output 1' },
                { id: 'output2', label: 'Output 2' },
            ],
        },
        position: { x: 0, y: 0 },
    },
    {
        id: '9',
        type: 'shader',
        data: {
            label: 'Another output node',
            inputs: [{ id: 'input1', label: 'Input 1' }],
            outputs: [
                { id: 'output1', label: 'Output 1' },
                { id: 'output2', label: 'Output 2' },
            ],
        },
        position: { x: 400, y: 0 },
    },
    {
        id: '10',
        type: 'comment',
        data: {
            message: "Hello I am a comment node.\nI'm not connected to anything",
        },
        position: { x: 0, y: 200 },
    },
    {
        id: '11',
        type: 'connector',
        data: {},
        position: { x: 100, y: 400 },
    },
];

export const defaultEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
    { id: 'e5-7', source: '5', target: '7' },
];
