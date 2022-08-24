import { EdgeImpl } from './edge';
import { GraphImpl } from './graph';
import { NodeImpl } from './node';

import type { Action, Edge, Id, Node, SerializedGraph, Value } from './types';

export function loadGraph(json: SerializedGraph): Action {
    let graph: GraphImpl;

    return {
        label: 'Load Graph',
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

export function createNode(config: { graph: Id; descriptor: Id }): Action {
    let node: NodeImpl | undefined;

    return {
        label: 'Create Node',
        execute(engine) {
            const graph = engine.getGraph(config.graph);
            const descriptor = engine.registry.getNodeDescriptor(config.descriptor);

            node = new NodeImpl({ descriptor });

            graph.addNode(node);
        },
        undo(engine) {
            const graph = engine.getGraph(config.graph);
            graph.deleteNode(node!.id);

            node = undefined;
        },
    };
}

export function setNodeProperty(config: {
    graph: Id;
    node: Id;
    name: string;
    value: Value;
}): Action {
    let value: Value | undefined;

    return {
        label: 'Set Node Property',
        execute(engine) {
            const graph = engine.getGraph(config.graph);
            const node = graph.getNode(config.node);

            const property = node.getProperty(config.name);
            if (!property) {
                throw new Error(`Property with name ${config.name} does not exist.`);
            }

            node.setProperty(config.name, config.value);

            value = property;
        },
        undo(engine) {
            const graph = engine.getGraph(config.graph);
            const node = graph.getNode(config.node);

            node.setProperty(config.name, value!);
        },
    };
}

export function deleteNode(config: { graph: Id; node: Id }): Action {
    let node: Node | undefined;
    let edges: Edge[] = [];

    return {
        label: 'Delete Node',
        execute(engine) {
            const graph = engine.getGraph(config.graph);

            node = graph.getNode(config.node);
            edges = [...graph.getIncomingEdges(node), ...graph.getOutgoingEdges(node)];

            for (const edge of edges) {
                graph.deleteEdge(edge.id);
            }
        },
        undo(engine) {
            const graph = engine.getGraph(config.graph);

            graph.addNode(node!);
            for (const edge of edges) {
                graph.addEdge(edge);
            }

            node = undefined;
            edges.length = 0;
        },
    };
}

export function createEdge(config: {
    graph: Id;
    from: Id;
    fromPort: Id;
    to: Id;
    toPort: Id;
}): Action {
    let edge: EdgeImpl | undefined;

    return {
        label: 'Create Edge',
        execute(engine) {
            const graph = engine.getGraph(config.graph);
            edge = new EdgeImpl(config);

            graph.addEdge(edge);
        },
        undo(engine) {
            const graph = engine.getGraph(config.graph);
            graph.deleteEdge(edge!.id);

            edge = undefined;
        },
    };
}

export function deleteEdge(config: { graph: Id; edge: Id }): Action {
    let edge: Edge | undefined;

    return {
        label: 'Delete Edge',
        execute(engine) {
            const graph = engine.getGraph(config.graph);
            const deletedEdge = graph.deleteEdge(config.edge);

            edge = deletedEdge;
        },
        undo(engine) {
            const graph = engine.getGraph(config.graph);

            graph.addEdge(edge!);
            edge = undefined;
        },
    };
}
