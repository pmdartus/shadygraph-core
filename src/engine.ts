import { loadBitmapToTexture } from './builtins/bitmap';
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
        createGraph(config) {
            return Graph.create(config, { engine });
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
                    if (node.type !== 'shader') {
                        return Promise.resolve();
                    }

                    const shaderDescriptor = shaderMap.get(node.shader)!;
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
                }),
            );

            for (const node of nodes) {
                if (node.type === 'shader') {
                    const shaderDescriptor = shaderMap.get(node.shader)!;
                    const compiledShader = compiledShaderMap.get(shaderDescriptor)!;

                    const properties = node.getProperties();
                    const inputs = node.getInputs();
                    const outputs = node.getOutputs();

                    compiledShader.render(properties, inputs, outputs);
                } else if (node.type === 'builtin') {
                    const properties = node.getProperties();
                    const outputs = node.getOutputs();

                    await loadBitmapToTexture(
                        backend,
                        properties.source.value as string,
                        outputs.output,
                    );
                }
            }

            return backend.waitUntilDone();
        },
    };

    return engine;
}
