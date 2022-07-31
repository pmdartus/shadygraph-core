import { Graph } from './graph';
import { shaders } from './shaders/main';

import type { CompilerShader, Engine, EngineConfig, ShaderDescriptor } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { backend } = config;

    const shaderMap = new Map<string, ShaderDescriptor>(
        shaders.map((shader) => [shader.id, shader]),
    );

    const compiledShaderMap = new Map<ShaderDescriptor, CompilerShader>();
    const compiledShaderPromiseMap = new Map<ShaderDescriptor, Promise<CompilerShader>>();

    const engine: Engine = {
        backend,
        createGraph(config) {
            return Graph.create(config, { engine });
        },
        getShaderDescriptor(id) {
            return shaderMap.get(id);
        },
        getCompiledShader(id) {
            const shaderDescriptor = shaderMap.get(id)!;
            let shaderCompiledPromise = compiledShaderPromiseMap.get(shaderDescriptor);

            if (!shaderCompiledPromise) {
                shaderCompiledPromise = backend
                    .compileShader(shaderDescriptor)
                    .then((compilerShader) => {
                        compiledShaderMap.set(shaderDescriptor, compilerShader);
                        return compilerShader;
                    });

                compiledShaderPromiseMap.set(shaderDescriptor, shaderCompiledPromise);
            }

            return shaderCompiledPromise;
        },
        loadGraph(data) {
            return Graph.fromJSON(data, { engine });
        },
        async renderGraph(graph) {
            const ctx = {
                engine,
                graph,
                backend,
            };

            for (const node of graph.iterNodes()) {
                await node.execute(ctx);
            }

            return backend.waitUntilDone();
        },
    };

    return engine;
}
