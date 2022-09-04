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

import Focus from '@/icons/Focus';
import Magnet from '@/icons/Magnet';
import MagnetOn from '@/icons/MagnetOn';
import ResetZoom from '@/icons/ResetZoom';
import ElbowConnector from '@/icons/ElbowConnector';
import CurvedConnector from '@/icons/CurvedConnector';
import TransitConnection from '@/icons/TransitConnection';
import TransitConnectionHorizontal from '@/icons/TransitConnectionHorizontal';

import { ActionButton } from '@/components/ActionButton';
import { ActionToggleButton } from '@/components/ActionToggleButton';

import { useResizeObserver } from '@/hooks/useResizeObserver';

import { CommentNode } from './custom-nodes/CommentNode';
import { ConnectorNode } from './custom-nodes/ConnectorNode';
import { ShaderNode } from './custom-nodes/ShaderNode';
import { defaultNodes, defaultEdges } from './default';
import {
    alignSelectedNodesHorizontally,
    alignSelectedNodesVertically,
    GRID_SIZE,
    selectedNodes,
    snapSelectedNodesToGrid,
} from './graph-utils';

import './Graph.css';

const nodeTypes = { shader: ShaderNode, comment: CommentNode, connector: ConnectorNode };

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
            <div className="p-1 border-b border-slate-600">
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
            </div>

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
