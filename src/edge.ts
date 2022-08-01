import { Graph } from './graph';
import { uuid } from './utils/uuid';

import type { Edge } from './types';

export type EdgeConfig = Omit<Edge, 'id'>;
export type SerializedEdge = any;

export class EdgeImpl implements Edge {
    id: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;

    /** @internal */
    constructor(config: Edge) {
        this.id = config.id;
        this.from = config.from;
        this.fromPort = config.fromPort;
        this.to = config.to;
        this.toPort = config.toPort;
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

    static fromJSON(json: SerializedEdge): EdgeImpl {
        return new EdgeImpl(json);
    }

    static create(config: EdgeConfig): EdgeImpl {
        return new EdgeImpl({ ...config, id: uuid() });
    }
}

export function isValidEdge(
    config: EdgeConfig,
    graph: Graph,
): { isValid: true } | { isValid: false; reason: string } {
    const fromNode = graph.getNode(config.from);
    if (!fromNode) {
        return { isValid: false, reason: `No node found with id ${config.from}` };
    }

    const fromDescriptor = fromNode.descriptor;
    if (!Object.hasOwn(fromDescriptor.outputs, config.fromPort)) {
        return { isValid: false, reason: `No output found with name ${config.fromPort}` };
    }

    const toNode = graph.getNode(config.to);
    if (!toNode) {
        return { isValid: false, reason: `No node found with id ${config.to}` };
    }

    const toDescriptor = toNode.descriptor;
    if (!Object.hasOwn(toDescriptor.inputs, config.toPort)) {
        return { isValid: false, reason: `No input found with name ${config.toPort}` };
    }

    const isInputAlreadyConnected = graph
        .getIncomingEdges(toNode)
        .some((edge) => edge.toPort === config.toPort);
    if (isInputAlreadyConnected) {
        return { isValid: false, reason: `Input ${config.toPort} is already connected` };
    }

    // TODO: Add cycle detection.

    return { isValid: true };
}
