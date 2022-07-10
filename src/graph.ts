import { createNode } from './node';
import { uuid } from './utils/uuid';

import type { Edge, EdgeConfig, Engine, Graph, Node } from './types';

interface GraphConfig {
    id?: string;
}

function createEdge(config: EdgeConfig, graph: Graph): Edge {
    const { id = uuid(), from, fromPort, to, toPort } = config;

    return {
        id,
        get from() {
            return graph.getNode(from)!;
        },
        get to() {
            return graph.getNode(to)!;
        },
        fromPort,
        toPort,
    };
}

export function createGraph(config: GraphConfig, engine: Engine): Graph {
    const { id = uuid() } = config;

    const nodes = new Map<string, Node>();
    const edges = new Map<string, Edge>();

    const graph: Graph = {
        id,

        getNode(id) {
            return nodes.get(id);
        },
        nodes() {
            return [...nodes.values()];
        },
        getEdge(id) {
            return edges.get(id);
        },
        edges() {
            return [...edges.values()];
        },

        createNode(config) {
            if (engine.getShaderDescriptor(config.shader) === undefined) {
                throw new Error(`Shader "${config.shader}" not found`);
            }

            const node = createNode(config, engine, graph);
            nodes.set(node.id, node);

            return node;
        },
        deleteNode(id) {
            const node = nodes.get(id);
            nodes.delete(id);

            return node;
        },

        createEdge(config) {
            const fromNode = nodes.get(config.from);
            if (!fromNode) {
                throw new Error(`Node "${config.from}" not found`);
            }

            const toNode = nodes.get(config.to);
            if (!toNode) {
                throw new Error(`Node "${config.to}" not found`);
            }

            const edge = createEdge(config, graph);
            edges.set(edge.id, edge);

            return edge;
        },
        deleteEdge() {
            const edge = edges.get(id);
            edges.delete(id);

            return edge;
        },

        sortedNodes() {
            const sorted = [];

            const inDegrees = new Map<Node, number>(
                Array.from(nodes.values()).map((node) => [node, 0]),
            );
            for (const edge of edges.values()) {
                inDegrees.set(edge.to, inDegrees.get(edge.to)! + 1);
            }

            while (inDegrees.size > 0) {
                for (const [node, inDegree] of inDegrees.entries()) {
                    if (inDegree === 0) {
                        inDegrees.delete(node);
                        sorted.push(node);

                        for (const edge of edges.values()) {
                            if (edge.from === node) {
                                inDegrees.set(edge.to, inDegrees.get(edge.to)! - 1);
                            }
                        }
                    }
                }
            }

            return sorted;
        },
    };

    return graph;
}
