import { Edge, isValidEdge, SerializedEdge } from './edge';
import { AbstractNode, Node, SerializedNode } from './node';

import { uuid } from './utils/uuid';

import type { Engine } from './types';

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

export interface GraphContext {
    engine: Engine;
    graph: Graph;
}

export class Graph {
    id: string;
    size: number;
    label: string;
    _nodeMap = new Map<string, Node>();
    _edgeMap = new Map<string, Edge>();
    #engine: Engine;

    /** @internal */
    constructor(config: { id: string; size: number; label: string; engine: Engine }) {
        this.id = config.id;
        this.size = config.size;
        this.label = config.label;
        this.#engine = config.engine;
    }

    getNode(id: string): Node | undefined {
        return this._nodeMap.get(id);
    }

    getEdge(id: string): Edge | undefined {
        return this._edgeMap.get(id);
    }

    getOutgoingEdges(node: AbstractNode): Edge[] {
        return Array.from(this._edgeMap.values()).filter((edge) => edge.from === node.id);
    }

    getIncomingEdges(node: AbstractNode): Edge[] {
        return Array.from(this._edgeMap.values()).filter((edge) => edge.to === node.id);
    }

    clone(): Graph {
        const graph = new Graph({
            id: this.id,
            size: this.size,
            label: this.label,
            engine: this.#engine,
        });

        graph._nodeMap = new Map(this._nodeMap);
        graph._edgeMap = new Map(this._edgeMap);

        return graph;
    }

    *iterNodes(): Iterable<Node> {
        const inDegrees = new Map<Node, number>(
            Array.from(this._nodeMap.values()).map((node) => [node, 0]),
        );

        for (const edge of this._edgeMap.values()) {
            const toNode = edge.toNode();
            inDegrees.set(toNode, inDegrees.get(toNode)! + 1);
        }

        while (inDegrees.size > 0) {
            for (const [node, inDegree] of inDegrees.entries()) {
                if (inDegree === 0) {
                    inDegrees.delete(node);

                    yield node;

                    for (const edge of this.getOutgoingEdges(node)) {
                        const toNode = edge.toNode();
                        inDegrees.set(toNode, inDegrees.get(toNode)! - 1);
                    }
                }
            }
        }
    }

    toJSON(): SerializedGraph {
        const { id, size, label, _nodeMap, _edgeMap } = this;

        const nodes = Object.fromEntries(
            Array.from(_nodeMap.values()).map((node) => [node.id, node.toJSON() as SerializedNode]),
        );
        const edges = Object.fromEntries(
            Array.from(_edgeMap.values()).map((edge) => [edge.id, edge.toJSON()]),
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
        const graph = new Graph({
            ...json,
            engine: ctx.engine,
        });

        const graphCtx = { ...ctx, graph };

        for (const [id, serializedNode] of Object.entries(json.nodes)) {
            const node = AbstractNode.fromJSON(serializedNode, graphCtx);
            graph._nodeMap.set(id, node);
        }

        for (const [id, serializedEdge] of Object.entries(json.edges)) {
            const edge = Edge.fromJSON(serializedEdge, graphCtx);
            if (!isValidEdge(edge, graph)) {
                throw new Error(`Invalid edge: ${JSON.stringify(serializedEdge)}`);
            }

            graph._edgeMap.set(id, edge);
        }

        return graph;
    }

    static create(config: GraphConfig, ctx: { engine: Engine }): Graph {
        return new Graph({
            id: uuid(),
            size: config.size ?? 512,
            label: config.label ?? '',
            engine: ctx.engine,
        });
    }
}
