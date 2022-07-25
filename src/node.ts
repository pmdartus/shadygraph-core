import { Graph, GraphContext } from './graph';
import { createValue } from './value';
import { uuid } from './utils/uuid';

import type { NodeDescriptor, Texture, Value } from './types';

export interface NodeConfig {
    id?: string;
    descriptor: NodeDescriptor;
    properties?: Record<string, Value>;
    outputs?: Record<string, Texture>;
}

export interface BaseSerializedNode {
    id: string;
    properties: Record<string, Value>;
}

export type Node = ShaderNode | BuiltinNode;
export type SerializedNode = ShaderSerializedNode | BuiltinSerializedNode;

export abstract class AbstractNode {
    id: string;
    descriptor: NodeDescriptor;
    properties: Record<string, Value>;
    outputs: Record<string, Texture>;
    #graph: Graph;

    /** @internal */
    constructor(config: NodeConfig, ctx: GraphContext) {
        this.id = config.id ?? uuid();
        this.descriptor = config.descriptor;
        this.properties = config.properties ?? {};

        if (config.outputs) {
            this.outputs = config.outputs;
        } else {
            this.outputs = Object.fromEntries(
                Object.entries(this.descriptor.outputs).map(([name, output]) => [
                    name,
                    ctx.engine.backend.createTexture({ type: output.type, size: ctx.graph.size }),
                ]),
            );
        }

        this.#graph = ctx.graph;
    }

    getProperties(): Record<string, Value> {
        return Object.fromEntries(
            Object.entries(this.descriptor.properties).map(([name, property]) => {
                const value = this.properties[name] ?? createValue(property.type, property.default);
                return [name, value];
            }),
        );
    }

    getInputs(): Record<string, Texture | null> {
        const incomingEdges = this.#graph.getIncomingEdges(this);

        return Object.fromEntries(
            Object.keys(this.descriptor.inputs).map((name) => {
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

    toJSON(): BaseSerializedNode {
        return {
            id: this.id,
            properties: this.properties,
        };
    }

    static fromJSON(json: SerializedNode, ctx: GraphContext): Node {
        switch (json.type) {
            case 'shader':
                return ShaderNode.create(json, ctx);

            case 'builtin':
                return BuiltinNode.create(json, ctx);
        }
    }
}

export interface ShaderNodeConfig extends NodeConfig {
    shader: string;
}

export interface ShaderSerializedNode extends BaseSerializedNode {
    type: 'shader';
    shader: string;
}

class ShaderNode extends AbstractNode {
    type = 'shader' as const;
    shader: string;

    constructor(config: ShaderNodeConfig, ctx: GraphContext) {
        super(config, ctx);
        this.shader = config.shader;
    }

    toJSON(): ShaderSerializedNode {
        return {
            ...this.toJSON(),
            type: this.type,
            shader: this.shader,
        };
    }

    static create(config: Omit<ShaderNodeConfig, 'descriptor'>, ctx: GraphContext): ShaderNode {
        const descriptor = ctx.engine.getShaderDescriptor(config.shader);
        if (!descriptor) {
            throw new Error(`Shader ${config.shader} not found`);
        }

        return new ShaderNode(
            {
                ...config,
                descriptor,
            },
            ctx,
        );
    }
}

export enum BuiltInNodeType {
    Input = 'input',
    Output = 'output',
    Bitmap = 'bitmap',
    SVG = 'svg',
}

const BUILTIN_NODE_DESCRIPTORS: { [name in BuiltInNodeType]: NodeDescriptor } = {
    [BuiltInNodeType.Input]: {
        properties: {},
        inputs: {},
        outputs: {
            output: {
                label: 'Output',
                type: 'color',
            },
        },
    },
    [BuiltInNodeType.Output]: {
        properties: {},
        inputs: {
            input: {
                label: 'Input',
                type: 'color',
            },
        },
        outputs: {},
    },
    [BuiltInNodeType.Bitmap]: {
        properties: {
            source: {
                label: 'Source',
                description: 'Image source URL or file path',
                type: 'string',
                default: '',
            },
        },
        inputs: {},
        outputs: {
            output: {
                label: 'Output',
                type: 'color',
            },
        },
    },
    [BuiltInNodeType.SVG]: {
        properties: {
            source: {
                label: 'Source',
                description: 'Image source URL or file path',
                type: 'string',
                default: '',
            },
        },
        inputs: {},
        outputs: {
            output: {
                label: 'Output',
                type: 'color',
            },
        },
    },
};

export interface BuiltinNodeConfig extends NodeConfig {
    nodeType: BuiltInNodeType;
}

export interface BuiltinSerializedNode extends BaseSerializedNode {
    type: 'builtin';
    nodeType: BuiltInNodeType;
}

class BuiltinNode extends AbstractNode {
    type = 'builtin' as const;
    nodeType: BuiltInNodeType;

    constructor(config: BuiltinNodeConfig, ctx: GraphContext) {
        super(config, ctx);
        this.nodeType = config.nodeType;
    }

    toJSON(): BuiltinSerializedNode {
        return {
            ...this.toJSON(),
            type: this.type,
            nodeType: this.nodeType,
        };
    }

    static create(config: Omit<BuiltinNodeConfig, 'descriptor'>, ctx: GraphContext): BuiltinNode {
        const descriptor = BUILTIN_NODE_DESCRIPTORS[config.nodeType];
        if (!descriptor) {
            throw new Error(`Builtin node type ${config.nodeType} not found`);
        }

        return new BuiltinNode(
            {
                ...config,
                descriptor,
            },
            ctx,
        );
    }
}
