import { createFloat1, createInt1 } from '../../value';
import type { CompiledShader, NodeDescriptor, ShaderNodeDescriptor } from '../../types';

export function createShaderDescriptor(desc: ShaderNodeDescriptor): NodeDescriptor {
    // TODO: Add a mechanism to destroy the compiled shader.
    let compiledShaderPromise: Promise<CompiledShader> | undefined;

    return {
        ...desc,
        async execute(ctx) {
            if (!compiledShaderPromise) {
                compiledShaderPromise = ctx.backend.compileShader(desc);
            }

            const compileShader = await compiledShaderPromise;

            const properties = ctx.getProperties();
            const inputs = ctx.getInputs();
            const outputs = ctx.getOutputs();

            // TODO: Extract this somewhere else.
            const attributes = {
                seed: createFloat1([1.2902]),
                size: createInt1([ctx.graph.size]),
            };

            compileShader.render(properties, attributes, inputs, outputs);
        },
    };
}
