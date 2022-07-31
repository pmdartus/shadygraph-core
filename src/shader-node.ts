import { GraphContext } from './graph';
import { AbstractBaseNode, BaseSerializedNode, NodeConfig } from './node';

import type { ExecutionContext, Node } from './types';

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

    constructor(config: ShaderNodeConfig, ctx: GraphContext) {
        super(config, ctx);
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

        return new ShaderNode(
            {
                ...config,
                descriptor,
            },
            ctx,
        );
    }

    async execute(ctx: ExecutionContext) {
        const properties = this.getProperties();
        const inputs = this.getInputs();
        const outputs = this.getOutputs();

        const compiledShader = await ctx.engine.getCompiledShader(this.shader);
        compiledShader.render(properties, inputs, outputs);
    }
}
