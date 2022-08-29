import { beforeEach, describe, expect, test } from 'vitest';

import { Backend, createEngine, createInt1, Engine, Id, NodeDescriptor, Registry } from '../main';

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

    const descriptors: Record<Id, NodeDescriptor> = {
        test: {
            id: 'test',
            label: 'Test',
            inputs: {
                input: {
                    label: 'Input',
                    type: 'grayscale',
                },
            },
            outputs: {
                output: {
                    label: 'Output',
                    type: 'grayscale',
                },
            },
            properties: {
                intProp: {
                    type: 'int1',
                    label: 'Int Prop',
                    default: [0],
                    description: 'An integer property',
                },
            },
            async execute() {
                // Do nothing.
            },
        },
    };

    const mockRegistry: Registry = {
        getNodeDescriptor(id) {
            if (!Object.hasOwn(descriptors, id)) {
                throw new Error(`Unknown descriptor "${id}".`);
            }
            return descriptors[id];
        },
    };

    engine = createEngine({
        backend: mockBackend,
        registry: mockRegistry,
    });
});

test('createGraph', () => {
    const graph = engine.createGraph({ label: 'test' });

    expect(graph.id).toBeTypeOf('string');
    expect(graph.label).toBe('test');
});

describe('getGraph', () => {
    test('with existing graph', () => {
        const graph = engine.createGraph({ label: 'test' });
        const loadedGraph = engine.getGraph(graph.id);

        expect(loadedGraph).toBe(graph);
    });

    test('with non-existing graph', () => {
        expect(() => engine.getGraph('non-existing')).toThrow();
    });
});

describe('getGraphs', () => {
    test('with no graphs', () => {
        expect(engine.getGraphs()).toEqual({});
    });

    test('with existing graphs', () => {
        const foo = engine.createGraph({ label: 'foo' });
        const bar = engine.createGraph({ label: 'bar' });

        expect(engine.getGraphs()).toEqual({
            [bar.id]: bar,
            [foo.id]: foo,
        });
    });
});

describe('deleteGraph', () => {
    test('with non-existing graph', () => {
        expect(() => engine.deleteGraph('non-existing')).toThrow();
    });

    test('with existing graph', () => {
        const graph = engine.createGraph({ label: 'test' });
        const deleteGraph = engine.deleteGraph(graph.id);

        expect(graph).toBe(deleteGraph);
        expect(() => engine.getGraph(graph.id)).toThrow();
    });

    test('delete active node', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        engine.setActiveNode({ graph: graph.id, node: node.id });
        expect(engine.getActiveNode()).toBe(node);

        engine.deleteGraph(graph.id);
        expect(engine.getActiveNode()).toBeNull();
    });
});

describe('createNode', () => {
    test('with non-existing graph', () => {
        expect(() => engine.createNode({ graph: 'non-existing', descriptor: 'test' })).toThrow(
            /Graph with id non-existing does not exist/,
        );
    });

    test('with non-existing descriptor', () => {
        const graph = engine.createGraph({ label: 'test' });
        expect(() => engine.createNode({ graph: graph.id, descriptor: 'non-existing' })).toThrow(
            /Unknown descriptor "non-existing"./,
        );
    });

    test('with existing graph and descriptor', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        expect(node.id).toBeTypeOf('string');
        expect(node.label).toBe('Test');
    });
});

describe('setNodeProperty', () => {
    test('with non-existing graph', () => {
        expect(() =>
            engine.setNodeProperty({
                graph: 'non-existing',
                node: 'test',
                name: 'intProp',
                value: createInt1([1]),
            }),
        ).toThrow(/Graph with id non-existing does not exist/);
    });

    test('with non-existing node', () => {
        const graph = engine.createGraph({ label: 'test' });
        expect(() =>
            engine.setNodeProperty({
                graph: graph.id,
                node: 'non-existing',
                name: 'intProp',
                value: createInt1([1]),
            }),
        ).toThrow(/Node with id non-existing does not exist/);
    });

    test('with non-existing property', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });
        expect(() =>
            engine.setNodeProperty({
                graph: graph.id,
                node: node.id,
                name: 'non-existing',
                value: createInt1([1]),
            }),
        ).toThrow(/Property with name non-existing does not exist on test/);
    });

    test('with existing graph, node and property', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        expect(node.getProperty('intProp')).toEqual(createInt1([0]));

        const value = createInt1([1]);
        engine.setNodeProperty({
            graph: graph.id,
            node: node.id,
            name: 'intProp',
            value,
        });

        expect(node.getProperty('intProp')).toEqual(value);
    });
});

describe('deleteNode', () => {
    test('with non-existing graph', () => {
        expect(() => engine.deleteNode({ graph: 'non-existing', node: 'test' })).toThrow(
            /Graph with id non-existing does not exist/,
        );
    });

    test('with non-existing node', () => {
        const graph = engine.createGraph({ label: 'test' });
        expect(() => engine.deleteNode({ graph: graph.id, node: 'non-existing' })).toThrow(
            /Node with id non-existing does not exist/,
        );
    });

    test('with existing graph and node', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });
        const deletedItems = engine.deleteNode({ graph: graph.id, node: node.id });

        expect(deletedItems.node).toBe(node);
        expect(deletedItems.edges).toEqual([]);

        expect(() => graph.getNode(node.id)).toThrow();
    });

    test('with input and output edges', () => {
        const graph = engine.createGraph({ label: 'test' });

        const nodeA = engine.createNode({ graph: graph.id, descriptor: 'test' });
        const nodeB = engine.createNode({ graph: graph.id, descriptor: 'test' });
        const nodeC = engine.createNode({ graph: graph.id, descriptor: 'test' });

        const nodeAtoB = engine.createEdge({
            graph: graph.id,
            from: nodeA.id,
            fromPort: 'output',
            to: nodeB.id,
            toPort: 'input',
        });
        const nodeBtoC = engine.createEdge({
            graph: graph.id,
            from: nodeB.id,
            fromPort: 'output',
            to: nodeC.id,
            toPort: 'input',
        });

        const deletedItems = engine.deleteNode({ graph: graph.id, node: nodeB.id });

        expect(deletedItems.node).toBe(nodeB);
        expect(deletedItems.edges).toEqual([nodeAtoB, nodeBtoC]);
    });

    test('delete active node', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        const nodeRef = { graph: graph.id, node: node.id };

        engine.setActiveNode(nodeRef);
        expect(engine.getActiveNode()).toBe(node);

        engine.deleteNode(nodeRef);
        expect(engine.getActiveNode()).toBeNull();
    });
});

describe('setActiveNode', () => {
    test('null', () => {
        expect(engine.setActiveNode(null)).toBeNull();
    });

    test('with non-existing graph', () => {
        expect(() => engine.setActiveNode({ graph: 'non-existing', node: 'test' })).toThrow(
            /Graph with id non-existing does not exist/,
        );
    });

    test('with non-existing node', () => {
        const graph = engine.createGraph({ label: 'test' });
        expect(() => engine.setActiveNode({ graph: graph.id, node: 'non-existing' })).toThrow(
            /Node with id non-existing does not exist/,
        );
    });

    test('with existing graph and node', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        expect(engine.setActiveNode({ graph: graph.id, node: node.id })).toBe(node);
    });
});

describe('getActiveNode', () => {
    test('returns null by default', () => {
        expect(engine.getActiveNode()).toBeNull();
    });

    test('returns active node', () => {
        const graph = engine.createGraph({ label: 'test' });
        const node = engine.createNode({ graph: graph.id, descriptor: 'test' });

        engine.setActiveNode({ graph: graph.id, node: node.id });

        expect(engine.getActiveNode()).toBe(node);
    });
});
