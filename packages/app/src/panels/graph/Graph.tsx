import { useRef, useState } from 'react';
import ReactFlow, {
    getRectOfNodes,
    Background,
    BackgroundVariant,
    Edge,
    Node,
    ReactFlowInstance,
    NodeChange,
    applyNodeChanges,
    applyEdgeChanges,
    EdgeChange,
    addEdge,
    Connection,
} from 'react-flow-renderer';

import Focus from '../../icons/Focus';
import Magnet from '../../icons/Magnet';
import MagnetOn from '../../icons/MagnetOn';
import ResetZoom from '../../icons/ResetZoom';
import ElbowConnector from '../../icons/ElbowConnector';
import CurvedConnector from '../../icons/CurvedConnector';
import TransitConnection from '../../icons/TransitConnection';
import TransitConnectionHorizontal from '../../icons/TransitConnectionHorizontal';

import { ActionButton } from '../../components/ActionButton';
import { ActionToggleButton } from '../../components/ActionToggleButton';

import { useResizeObserver } from '../../hooks/useResizeObserver';

import { ShaderNode, ConnectorNode, CommentNode } from './custom-nodes';
import {
    alignSelectedNodesHorizontally,
    alignSelectedNodesVertically,
    GRID_SIZE,
    selectedNodes,
    snapSelectedNodesToGrid,
} from './graph-utils';

import './Graph.css';

const nodeTypes = { shader: ShaderNode, comment: CommentNode, connector: ConnectorNode };

const defaultNodes: Node[] = [
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

const defaultEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
    { id: 'e5-7', source: '5', target: '7' },
];

export function Graph() {
    const reactFlowInstanceRef = useRef<ReactFlowInstance>();

    const [nodes, setNodes] = useState<Node[]>(defaultNodes);
    const [edges, setEdges] = useState<Edge[]>(defaultEdges);

    const [stepEdges, setStepEdges] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);

    // Setting default values for the graph container size to avoid warnings from React Flow.
    const { width = 300, height = 500, ref: containerRef } = useResizeObserver();

    const handleFocusSelection = () => {
        const reactFlowInstance = reactFlowInstanceRef.current;
        if (!reactFlowInstance) {
            return;
        }

        const selected = selectedNodes(reactFlowInstance.getNodes());

        if (selected.length === 0) {
            reactFlowInstance.fitView();
        } else {
            const bounds = getRectOfNodes(selected);
            reactFlowInstance.fitBounds(bounds);
        }
    };

    const handleResetZoom = () => {
        if (!reactFlowInstanceRef.current) {
            return;
        }

        reactFlowInstanceRef.current.zoomTo(1);
    };

    const handleAlignHorizontally = () => {
        const nodes = reactFlowInstanceRef.current?.getNodes();
        if (!nodes) {
            return;
        }

        setNodes((nodes) => alignSelectedNodesHorizontally(nodes));
    };

    const handleAlignVertically = () => {
        const nodes = reactFlowInstanceRef.current?.getNodes();
        if (!nodes) {
            return;
        }

        setNodes((nodes) => alignSelectedNodesVertically(nodes));
    };

    const handleSnapToGrid = (enabled: boolean) => {
        setSnapToGrid(enabled);

        if (enabled) {
            const nodes = reactFlowInstanceRef.current?.getNodes();
            if (!nodes) {
                return;
            }

            setNodes((nodes) => snapSelectedNodesToGrid(nodes));
        }
    };

    const handleNodeChange = (changes: NodeChange[]) => {
        setNodes((nodes) => applyNodeChanges(changes, nodes));
    };

    const handleEdgeChange = (changes: EdgeChange[]) => {
        setEdges((edges) => applyEdgeChanges(changes, edges));
    };

    const handleConnect = (connection: Connection) => {
        setEdges((edges) => addEdge(connection, edges));
    };

    const styledEdges = edges.map((edge) => ({
        ...edge,
        type: stepEdges ? 'smoothstep' : 'default',
    }));

    return (
        <>
            <ActionButton onClick={handleFocusSelection} title="Focus elements">
                <Focus />
            </ActionButton>
            <ActionButton onClick={handleResetZoom} title="Reset zoom">
                <ResetZoom />
            </ActionButton>
            <ActionButton onClick={handleAlignHorizontally} title="Align horizontally">
                <TransitConnectionHorizontal />
            </ActionButton>
            <ActionButton onClick={handleAlignVertically} title="Align vertically">
                <TransitConnection />
            </ActionButton>

            <ActionToggleButton
                pressed={stepEdges}
                onPress={setStepEdges}
                title="Toggle step edges"
            >
                {stepEdges ? <ElbowConnector /> : <CurvedConnector />}
            </ActionToggleButton>
            <ActionToggleButton
                pressed={snapToGrid}
                onPress={handleSnapToGrid}
                title="Toggle snap nodes to grid"
            >
                {snapToGrid ? <MagnetOn /> : <Magnet />}
            </ActionToggleButton>

            <div ref={containerRef}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={styledEdges}
                    snapToGrid={snapToGrid}
                    snapGrid={[GRID_SIZE, GRID_SIZE]}
                    onInit={(instance) => (reactFlowInstanceRef.current = instance)}
                    onNodesChange={handleNodeChange}
                    onEdgesChange={handleEdgeChange}
                    onConnect={handleConnect}
                    style={{ width, height }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} size={1} />
                </ReactFlow>
            </div>
        </>
    );
}
