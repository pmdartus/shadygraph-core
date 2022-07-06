import { createGraph } from './graph';

import type { CompilerShader, Engine, EngineConfig, ShaderDescriptor } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { shaders } = config;

    const shaderMap = new Map<string, ShaderDescriptor>(shaders?.map((shader) => [shader.id, shader]));
    const compiledShaderMap = new Map<string, CompilerShader>();

    const getShaderDescriptor = (id: string): ShaderDescriptor => {
        return shaderMap.get(id)!;
    }

    return {
        createGraph() {
            return createGraph({
                getShaderDescriptor,
            });
        },
        registerShader(shader: ShaderDescriptor) {
            shaderMap.set(shader.id, shader);
            compiledShaderMap.delete(shader.id);
        },
    };
}
