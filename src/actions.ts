import { EdgeImpl } from './edge';
import { GraphImpl } from './graph';
import { NodeImpl } from './node';

import type { Action, Edge, Graph, Id, Node, SerializedGraph, Value } from './types';

export interface CreateGraphOptions {
    label?: string;
    size?: number;
}

export function createGraph(options: CreateGraphOptions): Action {
    let graph: Graph;

    return {
        label: 'Create graph',
        execute(engine) {
            graph = new GraphImpl(options);
            engine.addGraph(graph);
        },
        undo(engine) {
            engine.deleteGraph(graph.id);
        },
    };
}

export interface DeleteGraphOptions {
    id: Id;
}

export function deleteGraph(options: DeleteGraphOptions): Action {
    let graph: Graph;

    return {
        label: 'Delete graph',
        execute(engine) {
            graph = engine.getGraph(options.id);
            engine.deleteGraph(options.id);
        },
        undo(engine) {
            engine.addGraph(graph);
        },
    };
}

export function loadGraph(json: SerializedGraph): Action {
    let graph: GraphImpl;

    return {
        label: 'Load graph',
        execute(engine) {
            graph = new GraphImpl(json);

            for (const [id, serializedNode] of Object.entries(json.nodes)) {
                if (id !== serializedNode.id) {
                    throw new Error(
                        `Node id ${id} does not match serialized id ${serializedNode.id}`,
                    );
                }

                const descriptor = engine.registry.getNodeDescriptor(serializedNode.descriptor);
                const node = new NodeImpl({ ...serializedNode, descriptor });
                graph.addNode(node);
            }

            for (const [id, serializedEdge] of Object.entries(json.edges)) {
                if (id !== serializedEdge.id) {
                    throw new Error(
                        `Edge id ${id} does not match serialized id ${serializedEdge.id}`,
                    );
                }

                const edge = new EdgeImpl(serializedEdge);
                graph.addEdge(edge);
            }

            engine.addGraph(graph);
        },
        undo(engine) {
            engine.deleteGraph(graph.id);
        },
    };
}

export interface CreateNodeOptions {
    graph: Id;
    descriptor: Id;
}

export function createNode(options: CreateNodeOptions): Action {
    let node: NodeImpl | undefined;

    return {
        label: 'Create node',
        execute(engine) {
            const graph = engine.getGraph(options.graph);
            const descriptor = engine.registry.getNodeDescriptor(options.descriptor);

            node = new NodeImpl({ descriptor });

            graph.addNode(node);
        },
        undo(engine) {
            const graph = engine.getGraph(options.graph);
            graph.deleteNode(node!.id);

            node = undefined;
        },
    };
}

export interface SetNodePropertyOptions {
    graph: Id;
    node: Id;
    name: string;
    value: Value;
}

export function setNodeProperty(options: SetNodePropertyOptions): Action {
    let value: Value | undefined;

    return {
        label: 'Set node property',
        execute(engine) {
            const graph = engine.getGraph(options.graph);
            const node = graph.getNode(options.node);

            const property = node.getProperty(options.name);
            if (!property) {
                throw new Error(`Property with name ${options.name} does not exist.`);
            }

            node.setProperty(options.name, options.value);

            value = property;
        },
        undo(engine) {
            const graph = engine.getGraph(options.graph);
            const node = graph.getNode(options.node);

            node.setProperty(options.name, value!);
        },
    };
}

export interface DeleteNodeOptions {
    graph: Id;
    node: Id;
}

export function deleteNode(options: DeleteNodeOptions): Action {
    let node: Node | undefined;
    let edges: Edge[] = [];

    return {
        label: 'Delete node',
        execute(engine) {
            const graph = engine.getGraph(options.graph);

            node = graph.getNode(options.node);
            edges = [...graph.getIncomingEdges(node), ...graph.getOutgoingEdges(node)];

            for (const edge of edges) {
                graph.deleteEdge(edge.id);
            }
        },
        undo(engine) {
            const graph = engine.getGraph(options.graph);

            graph.addNode(node!);
            for (const edge of edges) {
                graph.addEdge(edge);
            }

            node = undefined;
            edges.length = 0;
        },
    };
}

export interface CreateEdgeOptions {
    graph: Id;
    from: Id;
    fromPort: Id;
    to: Id;
    toPort: Id;
}

export function createEdge(options: CreateEdgeOptions): Action {
    let edge: EdgeImpl | undefined;

    return {
        label: 'Create edge',
        execute(engine) {
            const graph = engine.getGraph(options.graph);
            edge = new EdgeImpl(options);

            graph.addEdge(edge);
        },
        undo(engine) {
            const graph = engine.getGraph(options.graph);
            graph.deleteEdge(edge!.id);

            edge = undefined;
        },
    };
}

export interface DeleteEdgeOptions {
    graph: Id;
    edge: Id;
}

export function deleteEdge(options: DeleteEdgeOptions): Action {
    let edge: Edge | undefined;

    return {
        label: 'Delete edge',
        execute(engine) {
            const graph = engine.getGraph(options.graph);
            const deletedEdge = graph.deleteEdge(options.edge);

            edge = deletedEdge;
        },
        undo(engine) {
            const graph = engine.getGraph(options.graph);

            graph.addEdge(edge!);
            edge = undefined;
        },
    };
}
