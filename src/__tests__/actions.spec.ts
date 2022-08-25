import { beforeEach, describe, expect, test } from 'vitest';

import { Backend, createEngine, createGraph, deleteGraph, Engine, Graph } from '../main';

let engine: Engine;

beforeEach(async () => {
    const mockBackend: Backend = {
        compileShader() {
            throw new Error('Not implemented');
        },
        createTexture() {
            throw new Error('Not implemented');
        },
        copyImageToTexture() {
            throw new Error('Not implemented');
        },
        waitUntilDone() {
            throw new Error('Not implemented');
        },
    };

    engine = createEngine({
        backend: mockBackend,
    });
});

describe('createGraph', () => {
    test('execute', () => {
        engine.dispatch(createGraph({ label: 'test' }));

        const graphs = engine.getGraphs();
        expect(Object.keys(graphs)).toHaveLength(1);

        const createdGraph = Object.values(graphs)[0];
        expect(createdGraph.label).toBe('test');
    });

    test('undo/redo', () => {
        engine.dispatch(createGraph({ label: 'test' }));

        const createdGraph = Object.values(engine.getGraphs())[0];
        expect(engine.getGraph(createdGraph.id)).toBeDefined();

        const undoResult = engine.undo();
        expect(undoResult).toBe(true);
        expect(() => engine.getGraph(createdGraph.id)).toThrow(/Graph with id .* does not exist./);

        const redoResult = engine.redo();
        expect(redoResult).toBe(true);
        expect(Object.keys(engine.getGraphs())).toHaveLength(1);
    });
});

describe('deleteGraph', () => {
    let graph: Graph;

    beforeEach(() => {
        engine.dispatch(createGraph({ label: 'test' }));
        graph = Object.values(engine.getGraphs())[0];
    });

    test('execute', () => {
        expect(engine.getGraphs()).toHaveProperty(graph.id);

        engine.dispatch(deleteGraph({ id: graph.id }));
        expect(engine.getGraphs()).not.toHaveProperty(graph.id);
    });

    test('undo/redo', () => {
        expect(engine.getGraphs()).toHaveProperty(graph.id);

        engine.dispatch(deleteGraph({ id: graph.id }));
        expect(engine.getGraphs()).not.toHaveProperty(graph.id);

        const undoResult = engine.undo();
        expect(undoResult).toBe(true);
        expect(engine.getGraphs()).toHaveProperty(graph.id);

        const redoResult = engine.redo();
        expect(redoResult).toBe(true);
        expect(engine.getGraphs()).not.toHaveProperty(graph.id);
    });
});

describe('createNode', () => {
    test('execute', () => {
        engine.dispatch(createGraph({ label: 'test' }));

        const createdGraph = Object.values(engine.getGraphs())[0];
        expect(createdGraph.label).toBe('test');
    });
});
