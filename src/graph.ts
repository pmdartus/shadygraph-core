import { createNode } from "./node";
import { uuid } from "./utils/uuid";

import type { Edge, EdgeConfig, Graph, Node, ShaderDescriptor } from "./types";

interface GraphInternalConfig {
    getShaderDescriptor(shader: string): ShaderDescriptor | undefined;
}

function createEdge(config: EdgeConfig): Edge {
    return {
        id: uuid(),
        ...config
    }
}

export function createGraph(config: GraphInternalConfig): Graph {
    const { getShaderDescriptor } = config;

    const id = uuid();

    const nodes = new Map<string, Node>();
    const edges = new Map<string, Edge>();

    return {
        id,

        getNode(id) {
            return nodes.get(id);
        },
        getEdge(id) {
            return edges.get(id);
        },

        createNode(config) {
            if (getShaderDescriptor(config.shader) === undefined) {
                throw new Error(`Shader "${config.shader}" not found`);
            }

            return createNode({
                ...config,
                getShaderDescriptor
            });
        },
        deleteNode(id) {
            const node = nodes.get(id);
            nodes.delete(id);
            return node;
        },

        createEdge(config) {
            const edge = createEdge(config);

            edges.set(edge.id, edge);
            return edge;
        },
        deleteEdge() {
            const edge = edges.get(id);
            edges.delete(id);
            return edge;
        }
    }
}