import { isValidEdge } from './edge';
import { uuid } from './utils/uuid';

import type { Node, Edge, Graph, SerializedGraph, Id } from './types';

export class GraphImpl implements Graph {
    id: Id;
    size: number;
    label: string;
    #nodeMap = new Map<Id, Node>();
    #edgeMap = new Map<Id, Edge>();

    constructor(config: { id?: Id; size?: number; label?: string }) {
        this.id = config.id ?? uuid();
        this.size = config.size ?? 512;
        this.label = config.label ?? '';
    }

    hasNode(id: Id): boolean {
        return this.#nodeMap.has(id);
    }

    getNode(id: Id): Node {
        const node = this.#nodeMap.get(id);
        if (!node) {
            throw new Error(`Node with id ${id} does not exist.`);
        }

        return node;
    }

    addNode(node: Node): void {
        if (this.#nodeMap.has(node.id)) {
            throw new Error(`Node with id ${node.id} already exists.`);
        }

        this.#nodeMap.set(node.id, node);
    }

    deleteNode(id: Id): Node {
        const node = this.getNode(id);

        for (const edge of this.getOutgoingEdges(node)) {
            this.#edgeMap.delete(edge.id);
        }
        for (const edge of this.getIncomingEdges(node)) {
            this.#edgeMap.delete(edge.id);
        }

        this.#nodeMap.delete(id);

        return node;
    }

    getEdge(id: Id): Edge {
        const edge = this.#edgeMap.get(id);
        if (!edge) {
            throw new Error(`Edge with id ${id} does not exist.`);
        }

        return edge;
    }

    addEdge(edge: Edge): void {
        if (this.#edgeMap.has(edge.id)) {
            throw new Error(`Edge with id ${edge.id} already exists.`);
        }

        const validationResult = isValidEdge(this, edge);
        if (!validationResult.isValid) {
            throw new Error(`Invalid edge: ${validationResult.reason}`);
        }

        this.#edgeMap.set(edge.id, edge);
    }

    deleteEdge(id: Id): Edge {
        const edge = this.getEdge(id);
        this.#edgeMap.delete(id);

        return edge;
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
            const toNode = this.getNode(edge.to);
            inDegrees.set(toNode, inDegrees.get(toNode)! + 1);
        }

        while (inDegrees.size > 0) {
            for (const [node, inDegree] of inDegrees.entries()) {
                if (inDegree === 0) {
                    inDegrees.delete(node);

                    yield node;

                    for (const edge of this.getOutgoingEdges(node)) {
                        const toNode = this.getNode(edge.to);
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
}
