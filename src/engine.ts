import { Graph } from './graph';
import { NodeRegistry } from './registry';

import type {
    Backend,
    Engine,
    EngineConfig,
    ExecutionContext,
    Node,
    Texture,
    Value,
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

    getProperty<T extends Value>(name: string): T | null {
        return this.#node.getProperty<T>(name);
    }
    getProperties(): Record<string, Value> {
        return this.#node.getProperties();
    }

    getInput(name: string): Texture | null {
        if (!this.#node.getInput(name)) {
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
            Object.keys(this.#node.getInputs()).map((name) => {
                return [name, this.getInput(name)];
            }),
        );
    }

    getOutput(name: string): Texture {
        const output = this.#node.getOutput(name);
        if (!output) {
            throw new Error(`Output "${name}" does not exist`);
        }

        if (Object.hasOwn(this.#node.outputs, name)) {
            return this.#node.outputs[name];
        } else {
            return (this.#node.outputs[name] = this.#engine.backend.createTexture({
                type: output.type,
                size: this.#graph.size,
            }));
        }
    }
    getOutputs(): Record<string, Texture> {
        return Object.fromEntries(
            Object.keys(this.#node.getOutputs()).map((name) => {
                return [name, this.getOutput(name)];
            }),
        );
    }
}

export function createEngine(config: EngineConfig): Engine {
    const { backend } = config;
    const registry = new NodeRegistry();

    const engine: Engine = {
        backend,
        registry,
        createGraph(config) {
            return Graph.create(config);
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
