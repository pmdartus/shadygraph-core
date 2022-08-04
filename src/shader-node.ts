import { GraphContext } from './graph';
import { AbstractBaseNode, BaseSerializedNode, NodeConfig } from './node';

import type { ExecutionContext, Node } from './types';
import { createFloat1, createInt1 } from './value';

export interface ShaderNodeConfig extends NodeConfig {
    shader: string;
}

export interface ShaderSerializedNode extends BaseSerializedNode {
    type: 'shader';
    shader: string;
}

export class ShaderNode extends AbstractBaseNode implements Node {
    type = 'shader' as const;
    shader: string;

    constructor(config: ShaderNodeConfig) {
        super(config);
        this.shader = config.shader;
    }

    toString() {
        return `ShaderNode [id: ${this.id}, shader: ${this.shader}]`;
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

        return new ShaderNode({
            ...config,
            descriptor,
        });
    }

    async execute(ctx: ExecutionContext) {
        const properties = this.getProperties();
        const inputs = ctx.getInputs();
        const outputs = ctx.getOutputs();

        const attributes = {
            seed: createFloat1([1.2902]),
            size: createInt1([ctx.graph.size]),
        };

        const compiledShader = await ctx.engine.getCompiledShader(this.shader);
        compiledShader.render(properties, attributes, inputs, outputs);
    }
}
