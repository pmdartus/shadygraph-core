import { Graph } from './graph';

import type { CompilerShader, Engine, EngineConfig, ShaderDescriptor } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { shaders, backend } = config;

    const shaderMap = new Map<string, ShaderDescriptor>(
        shaders?.map((shader) => [shader.id, shader]),
    );

    const compiledShaderMap = new Map<ShaderDescriptor, CompilerShader>();
    const compiledShaderPromiseMap = new Map<ShaderDescriptor, Promise<CompilerShader>>();

    const engine: Engine = {
        backend,
        createGraph() {
            return Graph.create({ engine });
        },
        registerShader(shader) {
            shaderMap.set(shader.id, shader);
        },
        getShaderDescriptor(id) {
            return shaderMap.get(id);
        },
        loadGraph(data) {
            return Graph.fromJSON(data, { engine });
        },
        async renderGraph(graph) {
            const nodes = Array.from(graph.iterNodes());

            await Promise.all(
                nodes.map(async (node) => {
                    const { shader } = node;

                    let shaderCompiledPromise = compiledShaderPromiseMap.get(shader);

                    if (!shaderCompiledPromise) {
                        const descriptor = shaderMap.get(shader.id)!;

                        shaderCompiledPromise = backend
                            .compileShader(descriptor)
                            .then((compilerShader) => {
                                compiledShaderMap.set(shader, compilerShader);
                                return compilerShader;
                            });

                        compiledShaderPromiseMap.set(shader, shaderCompiledPromise);
                    }

                    return shaderCompiledPromise;
                }),
            );

            for (const node of nodes) {
                const compiledShader = compiledShaderMap.get(node.shader)!;

                const properties = node.getProperties();
                const inputs = node.getInputs();
                const outputs = node.getOutputs();

                compiledShader.render(properties, inputs, outputs);
            }

            return backend.waitUntilDone();
        },
    };

    return engine;
}
