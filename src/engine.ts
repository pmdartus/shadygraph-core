import { createExecutionContext } from './context';
import { NodeRegistry } from './registry';

import type { Action, Engine, EngineConfig, Graph } from './types';

export function createEngine(config: EngineConfig): Engine {
    const { backend } = config;

    const graphs = new Map<string, Graph>();
    const registry = new NodeRegistry();

    const undoStack: Action[] = [];
    const redoStack: Action[] = [];

    return {
        backend,
        registry,
        dispatch(action) {
            action.execute(this);

            if (action.undo) {
                undoStack.push(action);
                redoStack.length = 0;
            }
        },
        undo() {
            const action = undoStack.pop();
            if (!action) {
                return false;
            }

            action.undo!(this);
            redoStack.push(action);

            return true;
        },
        redo() {
            const action = redoStack.pop();
            if (!action) {
                return false;
            }

            this.dispatch(action);
            return true;
        },
        addGraph(graph) {
            if (graphs.has(graph.id)) {
                throw new Error(`Graph with id ${graph.id} already exists.`);
            }

            graphs.set(graph.id, graph);
        },
        getGraph(id) {
            const graph = graphs.get(id);
            if (!graph) {
                throw new Error(`Graph with id ${id} does not exist.`);
            }

            return graph;
        },
        getGraphs() {
            return Object.fromEntries(graphs);
        },
        deleteGraph(id) {
            const graph = this.getGraph(id);
            graphs.delete(id);
            return graph;
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
