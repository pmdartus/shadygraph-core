import { createExecutionContext } from './context';
import { EdgeImpl } from './edge';
import { GraphImpl } from './graph';
import { NodeImpl } from './node';
import { NodeRegistry } from './registry';

import type { Engine, EngineConfig, Graph, Node, NodeReference } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { backend, registry = new NodeRegistry() } = config;

    const graphs = new Map<string, Graph>();
    let activeNode: NodeReference | null = null;

    return {
        backend,
        registry,
        createGraph(options) {
            const graph = new GraphImpl(options);
            if (graphs.has(graph.id)) {
                throw new Error(`Graph with id ${graph.id} does not exist.`);
            }

            graphs.set(graph.id, graph);
            return graph;
        },
        getGraph(id) {
            const graph = graphs.get(id);
            if (!graph) {
                throw new Error(`Graph with id ${id} does not exist.`);
            }

            return graph;
        },
        getGraphs() {
            return Object.fromEntries(graphs);
        },
        deleteGraph(id) {
            const graph = this.getGraph(id);

            if (activeNode?.graph === id) {
                this.setActiveNode(null);
            }

            graphs.delete(id);
            return graph;
        },
        loadGraph(options) {
            const graph = new GraphImpl(options.data);

            for (const [id, serializedNode] of Object.entries(options.data.nodes)) {
                if (id !== serializedNode.id) {
                    throw new Error(
                        `Node id ${id} does not match serialized id ${serializedNode.id}`,
                    );
                }

                const descriptor = registry.getNodeDescriptor(serializedNode.descriptor);
                const node = new NodeImpl({ ...serializedNode, descriptor });
                graph.addNode(node);
            }

            for (const [id, serializedEdge] of Object.entries(options.data.edges)) {
                if (id !== serializedEdge.id) {
                    throw new Error(
                        `Edge id ${id} does not match serialized id ${serializedEdge.id}`,
                    );
                }

                const edge = new EdgeImpl(serializedEdge);
                graph.addEdge(edge);
            }

            graphs.set(graph.id, graph);
            return graph;
        },
        createNode(options) {
            const graph = this.getGraph(options.graph);
            const descriptor = registry.getNodeDescriptor(options.descriptor);

            const node = new NodeImpl({ descriptor });
            graph.addNode(node);

            return node;
        },
        getNode(options) {
            const graph = this.getGraph(options.graph);
            return graph.getNode(options.node);
        },
        setNodeProperty(options) {
            const node = this.getNode(options);
            node.setProperty(options.name, options.value);

            return node;
        },
        deleteNode(options) {
            const graph = this.getGraph(options.graph);

            const node = graph.getNode(options.node);
            const edges = [...graph.getIncomingEdges(node), ...graph.getOutgoingEdges(node)];

            if (options.graph === activeNode?.graph && options.node === activeNode?.node) {
                this.setActiveNode(null);
            }

            for (const edge of edges) {
                graph.deleteEdge(edge.id);
            }
            graph.deleteNode(node.id);

            return {
                node,
                edges,
            };
        },
        createEdge(options) {
            const graph = this.getGraph(options.graph);

            const edge = new EdgeImpl(options);
            graph.addEdge(edge);

            return edge;
        },
        deleteEdge(options) {
            const graph = this.getGraph(options.graph);
            return graph.deleteEdge(options.edge);
        },
        setActiveNode(options) {
            let node: Node | null = null;

            if (options !== null) {
                const graph = this.getGraph(options.graph);
                node = graph.getNode(options.node);
            }

            activeNode = options;
            return node;
        },
        getActiveNode() {
            return activeNode !== null ? this.getNode(activeNode) : null;
        },
        async renderGraph(graph) {
            for (const node of graph.iterNodes()) {
                const ctx = createExecutionContext({
                    engine: this,
                    graph,
                    node,
                });

                await node.execute(ctx);
            }

            return backend.waitUntilDone();
        },
    };
}
