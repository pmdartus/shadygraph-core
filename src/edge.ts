import { GraphImpl } from './graph';
import { uuid } from './utils/uuid';

import { Edge, Node, SerializedEdge } from './types';

export type EdgeConfig = Omit<SerializedEdge, 'id'> & {
    id?: string;
};

export class EdgeImpl implements Edge {
    readonly id: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;

    constructor(config: EdgeConfig) {
        this.id = config.id ?? uuid();
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
        return new EdgeImpl(config);
    }
}

export function isValidEdge(
    graph: GraphImpl,
    config: EdgeConfig,
): { isValid: true } | { isValid: false; reason: string } {
    const fromNode = graph.getNode(config.from);
    if (!fromNode) {
        return { isValid: false, reason: `No node found with id ${config.from}` };
    }

    const outputDesc = fromNode.getOutput(config.fromPort);
    if (!outputDesc) {
        return { isValid: false, reason: `No output found with name ${config.fromPort}` };
    }

    const toNode = graph.getNode(config.to);
    if (!toNode) {
        return { isValid: false, reason: `No node found with id ${config.to}` };
    }

    const inputDesc = toNode.getInput(config.toPort);
    if (!inputDesc) {
        return { isValid: false, reason: `No input found with name ${config.toPort}` };
    }

    // TODO: Add IO type validation.
    // if (outputDesc.type !== inputDesc.type) {
    //     return {
    //         isValid: false,
    //         reason: `Output type ${outputDesc.type} does not match input type ${inputDesc.type}`,
    //     };
    // }

    const isInputAlreadyConnected = graph
        .getIncomingEdges(toNode)
        .some((edge) => edge.toPort === config.toPort);
    if (isInputAlreadyConnected) {
        return { isValid: false, reason: `Input ${config.toPort} is already connected` };
    }

    const hasCycle = checkCycles(graph, config);
    if (hasCycle) {
        return { isValid: false, reason: 'Cycle detected' };
    }

    return { isValid: true };
}

function checkCycles(graph: GraphImpl, config: EdgeConfig): boolean {
    const fromNode = graph.getNode(config.from)!;
    const toNode = graph.getNode(config.to)!;

    let current: Node | undefined;
    const visited: Set<Node> = new Set();
    const stack: Node[] = [toNode];

    // eslint-disable-next-line no-cond-assign
    while ((current = stack.pop())) {
        if (visited.has(current)) {
            continue;
        }

        visited.add(current);

        for (const edge of graph.getOutgoingEdges(current)) {
            const toNode = graph.getNode(edge.to)!;
            if (toNode === fromNode) {
                return true;
            }

            stack.push(toNode);
        }
    }

    return false;
}
