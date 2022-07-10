import { createGraph } from './graph';

import type { CompilerShader, Engine, EngineConfig, ShaderDescriptor } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { shaders, backend } = config;

    const shaderMap = new Map<string, ShaderDescriptor>(
        shaders?.map((shader) => [shader.id, shader]),
    );

    const compiledShaderMap = new Map<string, CompilerShader>();
    const compiledShaderPromiseMap = new Map<string, Promise<CompilerShader>>();

    const engine: Engine = {
        backend,
        createGraph() {
            return createGraph({}, engine);
        },
        registerShader(shader) {
            shaderMap.set(shader.id, shader);
            compiledShaderMap.delete(shader.id);
            compiledShaderMap.delete(shader.id);
        },
        getShaderDescriptor(id) {
            return shaderMap.get(id);
        },
        loadGraph(data) {
            const graph = createGraph(data, engine);

            for (const node of Object.values(data.nodes)) {
                graph.createNode(node);
            }

            for (const edges of Object.values(data.edges)) {
                graph.createEdge(edges);
            }

            return graph;
        },
        async renderGraph(graph) {
            const nodes = graph.sortedNodes();

            await Promise.all(
                nodes.map(async (node) => {
                    const { shader } = node;

                    let shaderCompiledPromise = compiledShaderPromiseMap.get(shader);

                    if (!shaderCompiledPromise) {
                        const descriptor = shaderMap.get(shader)!;

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
                compiledShader.render(node.properties, node.inputs, node.outputs);
            }

            return backend.waitUntilDone();
        },
    };

    return engine;
}
