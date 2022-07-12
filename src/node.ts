import { propertyTypeDefaultValue } from './shader-descriptor';

import { Graph } from './graph';
import { uuid } from './utils/uuid';

import type { Engine, ShaderDescriptor, Texture, Value } from './types';

export interface NodeConfig {
    shader: ShaderDescriptor;
    properties: Record<string, Value>;
}

export interface SerializedNode {
    id: string;
    shader: string;
    properties: Record<string, Value>;
}

export class Node {
    id: string;
    shader: ShaderDescriptor;
    properties: Record<string, Value>;
    outputs: Record<string, Texture>;
    #graph: Graph;

    /** @internal */
    constructor(
        config: NodeConfig & {
            id?: string;
            outputs: Record<string, Texture>;
            graph: Graph;
        },
    ) {
        this.id = config.id ?? uuid();
        this.properties = config.properties;
        this.outputs = config.outputs ?? {};
        this.shader = config.shader;

        this.#graph = config.graph;
    }

    getProperties(): Record<string, Value> {
        return Object.fromEntries(
            Object.entries(this.shader.properties).map(([name, property]) => {
                const value = this.properties[name] ?? propertyTypeDefaultValue(property);
                return [name, value];
            }),
        );
    }

    getInputs(): Record<string, Texture | null> {
        const incomingEdges = this.#graph.getIncomingEdges(this);

        return Object.fromEntries(
            Object.keys(this.shader.inputs).map((name) => {
                let texture: Texture | null = null;

                const inputEdge = incomingEdges.find((edge) => edge.toPort === name);
                if (inputEdge) {
                    texture = inputEdge.fromNode().outputs[inputEdge.fromPort];
                }

                return [name, texture];
            }),
        );
    }

    getOutputs(): Record<string, Texture> {
        return this.outputs;
    }

    toJSON(): SerializedNode {
        return {
            id: this.id,
            shader: this.shader.id,
            properties: this.properties,
        };
    }

    static fromJSON(json: SerializedNode, ctx: { engine: Engine; graph: Graph }): Node {
        const shader = ctx.engine.getShaderDescriptor(json.shader);
        if (!shader) {
            throw new Error(`Shader "${json.shader}" not found.`);
        }

        return Node.create(
            {
                ...json,
                shader,
            },
            ctx,
        );
    }

    static create(config: NodeConfig, ctx: { engine: Engine; graph: Graph }): Node {
        const outputs = Object.fromEntries(
            Object.entries(config.shader.outputs).map(([name, texture]) => [
                name,
                ctx.engine.backend.createTexture({ size: ctx.graph.size, type: texture.type }),
            ]),
        );

        return new Node({
            ...config,
            outputs,
            graph: ctx.graph,
        });
    }
}
