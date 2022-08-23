import type { Engine, Graph, ExecutionContext, Value, Node, Texture } from './types';

interface ExecutionContextConfig {
    engine: Engine;
    graph: Graph;
    node: Node;
}

export function createExecutionContext({
    engine,
    graph,
    node,
}: ExecutionContextConfig): ExecutionContext {
    const { backend } = engine;

    return {
        graph,
        backend,

        getProperty<T extends Value>(name: string): T | null {
            return node.getProperty<T>(name);
        },
        getProperties(): Record<string, Value> {
            return node.getProperties();
        },

        getInput(name: string): Texture | null {
            if (!node.getInput(name)) {
                throw new Error(`Input "${name}" does not exist`);
            }

            const incomingEdges = graph.getIncomingEdges(node);
            const inputEdge = incomingEdges.find((edge) => edge.toPort === name);

            if (!inputEdge) {
                return null;
            } else {
                const fromNode = graph.getNode(inputEdge.from);
                return fromNode.outputs[inputEdge.fromPort] ?? null;
            }
        },
        getInputs(): Record<string, Texture | null> {
            return Object.fromEntries(
                Object.keys(node.getInputs()).map((name) => {
                    return [name, this.getInput(name)];
                }),
            );
        },

        getOutput(name: string): Texture {
            const output = node.getOutput(name);
            if (!output) {
                throw new Error(`Output "${name}" does not exist`);
            }

            if (Object.hasOwn(node.outputs, name)) {
                return node.outputs[name];
            } else {
                return (node.outputs[name] = engine.backend.createTexture({
                    type: output.type,
                    size: graph.size,
                }));
            }
        },
        getOutputs(): Record<string, Texture> {
            return Object.fromEntries(
                Object.keys(node.getOutputs()).map((name) => {
                    return [name, this.getOutput(name)];
                }),
            );
        },
    };
}
