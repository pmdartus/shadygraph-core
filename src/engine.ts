import { Graph } from './graph';
import { shaders } from './shaders/main';

import type {
    Backend,
    CompilerShader,
    Engine,
    EngineConfig,
    ExecutionContext,
    Node,
    ShaderDescriptor,
    Texture,
} from './types';

class ExecutionContextImpl implements ExecutionContext {
    #engine: Engine;
    #graph: Graph;
    #node: Node;

    constructor(engine: Engine, graph: Graph, node: Node) {
        this.#engine = engine;
        this.#graph = graph;
        this.#node = node;
    }

    get engine(): Engine {
        return this.#engine;
    }

    get backend(): Backend {
        return this.#engine.backend;
    }

    get graph(): Graph {
        return this.#graph;
    }

    get node(): Node {
        return this.#node;
    }

    getInput(name: string): Texture | null {
        if (!Object.hasOwn(this.#node.descriptor.inputs, name)) {
            throw new Error(`Input "${name}" does not exist`);
        }

        const incomingEdges = this.#graph.getIncomingEdges(this.#node);
        const inputEdge = incomingEdges.find((edge) => edge.toPort === name);

        if (!inputEdge) {
            return null;
        } else {
            const fromNode = this.#graph.getNode(inputEdge.from)!;
            return fromNode.outputs[inputEdge.fromPort] ?? null;
        }
    }

    getInputs(): Record<string, Texture | null> {
        return Object.fromEntries(
            Object.keys(this.#node.descriptor.inputs).map((name) => {
                return [name, this.getInput(name)];
            }),
        );
    }

    getOutput(name: string): Texture {
        if (!Object.hasOwn(this.#node.descriptor.outputs, name)) {
            throw new Error(`Output "${name}" does not exist`);
        }

        if (Object.hasOwn(this.#node.outputs, name)) {
            return this.#node.outputs[name];
        } else {
            return (this.#node.outputs[name] = this.#engine.backend.createTexture({
                type: this.#node.descriptor.outputs[name].type,
                size: this.#graph.size,
            }));
        }
    }

    getOutputs(): Record<string, Texture> {
        return Object.fromEntries(
            Object.keys(this.#node.descriptor.outputs).map((name) => {
                return [name, this.getOutput(name)];
            }),
        );
    }
}

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
            return Graph.create(config);
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
            for (const node of graph.iterNodes()) {
                const ctx = new ExecutionContextImpl(engine, graph, node);
                await node.execute(ctx);
            }

            return backend.waitUntilDone();
        },
    };

    return engine;
}
