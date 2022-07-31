import { Graph, GraphContext } from './graph';
import { createValue } from './value';
import { uuid } from './utils/uuid';

import type { Backend, Engine, NodeDescriptor, Texture, Value } from './types';

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

export type Node = ShaderNode | AbstractBuiltinNode;
export type SerializedNode = ShaderSerializedNode | BuiltinSerializedNode;

export interface ExecutionContext {
    engine: Engine;
    graph: Graph;
    backend: Backend;
}

export abstract class AbstractBaseNode {
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
            Object.keys(this.descriptor.properties).map((name) => [name, this.getProperty(name)!]),
        );
    }

    getProperty<T extends Value>(name: string): T | null {
        if (!Object.hasOwn(this.descriptor.properties, name)) {
            return null;
        }

        if (Object.hasOwn(this.properties, name)) {
            return this.properties[name] as T;
        } else {
            const propertyDescriptor = this.descriptor.properties[name];
            return createValue<T>(propertyDescriptor.type, propertyDescriptor.default);
        }
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
        return { ...this.outputs };
    }

    getOutput(name: string): Texture | null {
        return Object.hasOwn(this.outputs, name) ? this.outputs[name] : null;
    }

    toJSON(): BaseSerializedNode {
        return {
            id: this.id,
            properties: this.properties,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_ctx: ExecutionContext): void | Promise<void> {
        throw new Error('Not implemented');
    }
}

export interface ShaderNodeConfig extends NodeConfig {
    shader: string;
}

export interface ShaderSerializedNode extends BaseSerializedNode {
    type: 'shader';
    shader: string;
}

export class ShaderNode extends AbstractBaseNode {
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

    async execute(ctx: ExecutionContext): Promise<void> {
        const properties = this.getProperties();
        const inputs = this.getInputs();
        const outputs = this.getOutputs();

        const compiledShader = await ctx.engine.getCompiledShader(this.shader);
        compiledShader.render(properties, inputs, outputs);
    }
}

export enum BuiltInNodeType {
    Input = 'input',
    Output = 'output',
    Bitmap = 'bitmap',
    SVG = 'svg',
}

export interface BuiltinNodeConfig extends NodeConfig {
    nodeType: BuiltInNodeType;
}

export interface BuiltinSerializedNode extends BaseSerializedNode {
    type: 'builtin';
    nodeType: BuiltInNodeType;
}

export abstract class AbstractBuiltinNode extends AbstractBaseNode {
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

    static get descriptor(): NodeDescriptor {
        throw new Error('Not implemented');
    }

    static create(
        config: Omit<BuiltinNodeConfig, 'descriptor'>,
        ctx: GraphContext,
    ): AbstractBuiltinNode {
        const descriptor = this.descriptor;

        // TODO: Find a better way to instantiate built-in classes.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        return new this({ ...config, descriptor }, ctx);
    }
}
