import { createExecutionContext } from './context';
import { GraphImpl } from './graph';
import { NodeRegistry } from './registry';

import type { Engine, EngineConfig } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { backend } = config;
    const registry = new NodeRegistry();

    return {
        backend,
        registry,
        createGraph(config) {
            return GraphImpl.create(config);
        },
        loadGraph(data) {
            return GraphImpl.fromJSON(data, { engine: this });
        },
        async renderGraph(graph) {
            for (const node of graph.iterNodes()) {
                const ctx = createExecutionContext({
                    engine: this,
                    graph,
                    node,
                });

                await node.execute(ctx);
            }

            return backend.waitUntilDone();
        },
    };
}
