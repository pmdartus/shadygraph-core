import { NodeImpl } from './node';
import { EdgeImpl, isValidEdge, SerializedEdge } from './edge';
import { uuid } from './utils/uuid';

import type { Engine, Node, Edge, Value } from './types';

export interface GraphConfig {
    size?: number;
    label?: string;
}

export interface SerializedGraph {
    id: string;
    size: number;
    label: string;
    nodes: Record<string, SerializedNode>;
    edges: Record<string, SerializedEdge>;
}

interface SerializedNode {
    id: string;
    descriptor: string;
    properties: Record<string, Value>;
}

export interface GraphContext {
    engine: Engine;
    graph: Graph;
}

export class Graph {
    id: string;
    size: number;
    label: string;
    #nodeMap = new Map<string, Node>();
    #edgeMap = new Map<string, Edge>();

    /** @internal */
    constructor(config: { id: string; size: number; label: string }) {
        this.id = config.id;
        this.size = config.size;
        this.label = config.label;
    }

    getNode(id: string): Node | undefined {
        return this.#nodeMap.get(id);
    }

    getEdge(id: string): Edge | undefined {
        return this.#edgeMap.get(id);
    }

    getOutgoingEdges(node: Node): Edge[] {
        return Array.from(this.#edgeMap.values()).filter((edge) => edge.from === node.id);
    }

    getIncomingEdges(node: Node): Edge[] {
        return Array.from(this.#edgeMap.values()).filter((edge) => edge.to === node.id);
    }

    *iterNodes(): Iterable<Node> {
        const inDegrees = new Map<Node, number>(
            Array.from(this.#nodeMap.values()).map((node) => [node, 0]),
        );

        for (const edge of this.#edgeMap.values()) {
            const toNode = this.getNode(edge.to)!;
            inDegrees.set(toNode, inDegrees.get(toNode)! + 1);
        }

        while (inDegrees.size > 0) {
            for (const [node, inDegree] of inDegrees.entries()) {
                if (inDegree === 0) {
                    inDegrees.delete(node);

                    yield node;

                    for (const edge of this.getOutgoingEdges(node)) {
                        const toNode = this.getNode(edge.to)!;
                        inDegrees.set(toNode, inDegrees.get(toNode)! - 1);
                    }
                }
            }
        }
    }

    toJSON(): SerializedGraph {
        const { id, size, label } = this;

        const nodes = Object.fromEntries(
            Array.from(this.#nodeMap.values()).map((node) => [node.id, node.toJSON()]),
        );
        const edges = Object.fromEntries(
            Array.from(this.#edgeMap.values()).map((edge) => [edge.id, edge.toJSON()]),
        );

        return {
            id,
            size,
            label,
            nodes,
            edges,
        };
    }

    static fromJSON(json: SerializedGraph, ctx: { engine: Engine }): Graph {
        const graph = new Graph(json);

        for (const [id, serializedNode] of Object.entries(json.nodes)) {
            const descriptor = ctx.engine.registry.getNodeDescriptor(serializedNode.descriptor);
            const node = new NodeImpl({ ...serializedNode, descriptor });

            graph.#nodeMap.set(id, node!);
        }

        for (const [id, serializedEdge] of Object.entries(json.edges)) {
            const edge = EdgeImpl.fromJSON(serializedEdge);

            const validationResult = isValidEdge(graph, edge);
            if (!validationResult.isValid) {
                throw new Error(`Invalid edge: ${validationResult.reason}`);
            }

            graph.#edgeMap.set(id, edge);
        }

        return graph;
    }

    static create(config: GraphConfig): Graph {
        return new Graph({
            id: uuid(),
            size: config.size ?? 512,
            label: config.label ?? '',
        });
    }
}
