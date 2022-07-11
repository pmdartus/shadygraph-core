import { Edge, isValidEdge, SerializedEdge } from './edge';
import { Node, SerializedNode } from './node';

import { uuid } from './utils/uuid';

import type { Engine } from './types';

export interface SerializedGraph {
    readonly id: string;
    readonly nodes: Record<string, SerializedNode>;
    readonly edges: Record<string, SerializedEdge>;
}

export class Graph {
    id: string;
    _nodeMap = new Map<string, Node>();
    _edgeMap = new Map<string, Edge>();
    #engine: Engine;

    /** @internal */
    constructor(config: { id: string; engine: Engine }) {
        this.id = config.id;
        this.#engine = config.engine;
    }

    getNode(id: string): Node | undefined {
        return this._nodeMap.get(id);
    }

    getEdge(id: string): Edge | undefined {
        return this._edgeMap.get(id);
    }

    getOutgoingEdges(node: Node): Edge[] {
        return Array.from(this._edgeMap.values()).filter((edge) => edge.from === node.id);
    }

    getIncomingEdges(node: Node): Edge[] {
        return Array.from(this._edgeMap.values()).filter((edge) => edge.to === node.id);
    }

    clone(): Graph {
        const graph = new Graph({
            id: this.id,
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
        const { id, _nodeMap, _edgeMap } = this;

        const nodes = Object.fromEntries(
            Array.from(_nodeMap.values()).map((node) => [node.id, node.toJSON()]),
        );
        const edges = Object.fromEntries(
            Array.from(_edgeMap.values()).map((edge) => [edge.id, edge.toJSON()]),
        );

        return {
            id,
            nodes,
            edges,
        };
    }

    static fromJSON(json: SerializedGraph, ctx: { engine: Engine }): Graph {
        const graph = new Graph({
            id: json.id,
            engine: ctx.engine,
        });

        const graphCtx = { ...ctx, graph };

        for (const [id, serializedNode] of Object.entries(json.nodes)) {
            const node = Node.fromJSON(serializedNode, graphCtx);
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

    static create(ctx: { engine: Engine }): Graph {
        return new Graph({
            id: uuid(),
            engine: ctx.engine,
        });
    }
}
