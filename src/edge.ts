import { GraphImpl } from './graph';
import { uuid } from './utils/uuid';

import { Edge, Id, Node, SerializedEdge } from './types';

export class EdgeImpl implements Edge {
    readonly id: Id;
    from: Id;
    fromPort: Id;
    to: Id;
    toPort: Id;

    constructor(config: { id?: Id; from: Id; fromPort: Id; to: Id; toPort: Id }) {
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
}

export function isValidEdge(
    graph: GraphImpl,
    edge: Edge,
): { isValid: true } | { isValid: false; reason: string } {
    if (!graph.hasNode(edge.from)) {
        return { isValid: false, reason: `No node found with id ${edge.from}` };
    }

    if (!graph.hasNode(edge.to)) {
        return { isValid: false, reason: `No node found with id ${edge.to}` };
    }

    const fromNode = graph.getNode(edge.from);
    const toNode = graph.getNode(edge.to);

    const outputDesc = fromNode.getOutput(edge.fromPort);
    if (!outputDesc) {
        return { isValid: false, reason: `No output found with name ${edge.fromPort}` };
    }

    const inputDesc = toNode.getInput(edge.toPort);
    if (!inputDesc) {
        return { isValid: false, reason: `No input found with name ${edge.toPort}` };
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
        .some((incomingEdge) => incomingEdge.toPort === edge.toPort);
    if (isInputAlreadyConnected) {
        return { isValid: false, reason: `Input ${edge.toPort} is already connected` };
    }

    const hasCycle = checkCycles(graph, edge);
    if (hasCycle) {
        return { isValid: false, reason: 'Cycle detected' };
    }

    return { isValid: true };
}

function checkCycles(graph: GraphImpl, config: Edge): boolean {
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
