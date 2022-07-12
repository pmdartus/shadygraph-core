import { Node } from './node';
import { Graph } from './graph';

import { uuid } from './utils/uuid';

export interface EdgeConfig {
    id?: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
}

export type SerializedEdge = Required<EdgeConfig>;

export class Edge {
    id: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
    #graph: Graph;

    /** @internal */
    constructor(config: {
        id?: string;
        from: string;
        fromPort: string;
        to: string;
        toPort: string;
        graph: Graph;
    }) {
        this.id = config.id ?? uuid();
        this.from = config.from;
        this.fromPort = config.fromPort;
        this.to = config.to;
        this.toPort = config.toPort;
        this.#graph = config.graph;
    }

    fromNode(): Node {
        return this.#graph.getNode(this.from)!;
    }

    toNode(): Node {
        return this.#graph.getNode(this.to)!;
    }

    toJSON(): SerializedEdge {
        return {
            id: this.id,
            from: this.from,
            fromPort: this.fromPort,
            to: this.to,
            toPort: this.toPort,
        };
    }

    static fromJSON(json: SerializedEdge, ctx: { graph: Graph }): Edge {
        return Edge.create(json, ctx);
    }

    static create(config: EdgeConfig, ctx: { graph: Graph }): Edge {
        return new Edge({ ...config, graph: ctx.graph });
    }
}

export function isValidEdge(
    config: EdgeConfig,
    graph: Graph,
): { isValid: boolean; reason?: string } {
    const fromNode = graph.getNode(config.from);
    if (!fromNode) {
        return { isValid: false, reason: `No node found with id ${config.from}` };
    }

    const output = fromNode.getOutputs()[config.fromPort];
    if (!output) {
        return { isValid: false, reason: `No output found with name ${config.fromPort}` };
    }

    const toNode = graph.getNode(config.to);
    if (!toNode) {
        return { isValid: false, reason: `No node found with id ${config.to}` };
    }

    const input = toNode.getInputs()[config.toPort];
    if (!input) {
        return { isValid: false, reason: `No input found with name ${config.toPort}` };
    }

    const isInputAlreadyConnected = graph
        .getIncomingEdges(toNode)
        .some((edge) => edge.toPort === config.toPort);
    if (isInputAlreadyConnected) {
        return { isValid: false, reason: `Input ${config.toPort} is already connected` };
    }

    return { isValid: true };
}
