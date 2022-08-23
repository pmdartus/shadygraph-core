import { NodeImpl } from './node';
import { EdgeImpl, isValidEdge } from './edge';
import { uuid } from './utils/uuid';

import type { Engine, Node, Edge, Graph, SerializedGraph, GraphConfig } from './types';

export class GraphImpl implements Graph {
    id: string;
    size: number;
    label: string;
    #nodeMap = new Map<string, Node>();
    #edgeMap = new Map<string, Edge>();

    constructor(config: { id: string; size: number; label: string }) {
        this.id = config.id;
        this.size = config.size;
        this.label = config.label;
    }

    getNode(id: string): Node | null {
        return this.#nodeMap.get(id) ?? null;
    }

    getEdge(id: string): Edge | null {
        return this.#edgeMap.get(id) ?? null;
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

    static fromJSON(json: SerializedGraph, ctx: { engine: Engine }): GraphImpl {
        const graph = new GraphImpl(json);

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

    static create(config: GraphConfig): GraphImpl {
        return new GraphImpl({
            id: uuid(),
            size: config.size ?? 512,
            label: config.label ?? '',
        });
    }
}
