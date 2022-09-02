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
} from 'react-flow-renderer';

import { useResizeObserver } from '../../hooks/useResizeObserver';

import './Graph.css';

interface FlowSelection {
    nodes: Node[];
    edges: Edge[];
}

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
    const flowSelectionRef = useRef<FlowSelection>();

    const [nodes, setNodes] = useState<Node[]>(defaultNodes);
    const [edges, setEdges] = useState<Edge[]>(defaultEdges);

    const [stepEdges, setStepEdges] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);

    // Setting default values for the graph container size to avoid warnings from React Flow.
    const { width = 300, height = 500, ref: containerRef } = useResizeObserver();

    const handleFocusSelection = () => {
        const reactFlowInstance = reactFlowInstanceRef.current;
        const selectedNodes = flowSelectionRef.current?.nodes ?? [];

        if (!reactFlowInstance) {
            return;
        }

        // TODO: Fix selection focus.
        if (selectedNodes.length === 0) {
            reactFlowInstance.fitView();
        } else {
            const bounds = getRectOfNodes(selectedNodes);
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
        if (!reactFlowInstanceRef.current) {
            return;
        }

        const selectedNodes = flowSelectionRef.current?.nodes ?? [];
        if (selectedNodes.length === 0) {
            return;
        }

        // TODO: Fix alignment by computing node center.
        const yPosition =
            selectedNodes.reduce((sum, node) => sum + node.position.y, 0) / selectedNodes.length;

        setNodes((nodes) =>
            nodes.map((node) => {
                if (selectedNodes.some((n) => n.id === node.id)) {
                    return { ...node, position: { ...node.position, y: yPosition } };
                } else {
                    return node;
                }
            }),
        );
    };

    const handleAlignVertically = () => {
        if (!reactFlowInstanceRef.current) {
            return;
        }

        const selectedNodes = flowSelectionRef.current?.nodes ?? [];
        if (selectedNodes.length === 0) {
            return;
        }

        // TODO: Fix alignment by computing node center.
        const xPosition =
            selectedNodes.reduce((sum, node) => sum + node.position.x, 0) / selectedNodes.length;

        setNodes((nodes) =>
            nodes.map((node) => {
                if (selectedNodes.some((n) => n.id === node.id)) {
                    return { ...node, position: { ...node.position, x: xPosition } };
                } else {
                    return node;
                }
            }),
        );
    };

    const handleNodeChange = (changes: NodeChange[]) => {
        setNodes((nodes) => applyNodeChanges(changes, nodes));
    };

    const handleEdgeChange = (changes: EdgeChange[]) => {
        setEdges((edges) => applyEdgeChanges(changes, edges));
    };

    const styledEdges = edges.map((edge) => ({
        ...edge,
        type: stepEdges ? 'smoothstep' : 'default',
    }));

    return (
        <>
            <button onClick={handleFocusSelection}>Focus selection</button>
            <button onClick={handleResetZoom}>Reset zoom</button>
            <button onClick={handleAlignHorizontally}>Align horizontally</button>
            <button onClick={handleAlignVertically}>Align vertically</button>
            <label>
                Step edges
                <input
                    type="checkbox"
                    checked={stepEdges}
                    onChange={(evt) => setStepEdges(evt.target.checked)}
                />
            </label>
            <label>
                Snap to grid
                <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(evt) => setSnapToGrid(evt.target.checked)}
                />
            </label>

            <div className="graph-container" ref={containerRef}>
                <ReactFlow
                    style={{ width, height }}
                    nodes={nodes}
                    edges={styledEdges}
                    snapToGrid={snapToGrid}
                    onInit={(instance) => (reactFlowInstanceRef.current = instance)}
                    onSelectionChange={(elements) => (flowSelectionRef.current = elements)}
                    onNodesChange={handleNodeChange}
                    onEdgesChange={handleEdgeChange}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                </ReactFlow>
            </div>
        </>
    );
}
