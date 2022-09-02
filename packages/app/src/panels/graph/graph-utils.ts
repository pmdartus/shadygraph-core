import { Node } from 'react-flow-renderer';

export const GRID_SIZE = 20;
export const SHADER_NODE_SIZE = 100;

function nodeWidth(node: Node): number {
    return node.width ?? SHADER_NODE_SIZE;
}

function nodeHeight(node: Node): number {
    return node.height ?? SHADER_NODE_SIZE;
}

export function selectedNodes(nodes: Node[]): Node[] {
    return nodes.filter((node) => node.selected);
}

export function alignSelectedNodesVertically(nodes: Node[]): Node[] {
    const selected = selectedNodes(nodes);
    const xPosition =
        selected.reduce((sum, node) => sum + node.position.x + nodeWidth(node) / 2, 0) /
        selected.length;

    return nodes.map((node) => {
        if (selected.includes(node)) {
            return {
                ...node,
                position: { ...node.position, x: xPosition - nodeWidth(node) / 2 },
            };
        } else {
            return node;
        }
    });
}

export function alignSelectedNodesHorizontally(nodes: Node[]): Node[] {
    const selected = selectedNodes(nodes);
    const yPosition =
        selected.reduce((sum, node) => sum + node.position.y + nodeHeight(node) / 2, 0) /
        selected.length;

    return nodes.map((node) => {
        if (selected.includes(node)) {
            return {
                ...node,
                position: { ...node.position, y: yPosition - nodeHeight(node) / 2 },
            };
        } else {
            return node;
        }
    });
}

export function snapSelectedNodesToGrid(nodes: Node[]): Node[] {
    const selected = selectedNodes(nodes);

    return nodes.map((node) => {
        if (selected.includes(node)) {
            const { x, y } = node.position;
            return {
                ...node,
                position: {
                    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
                    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
                },
            };
        } else {
            return node;
        }
    });
}
