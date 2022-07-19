import { WebGPUBackend, UNIFORM_COLOR, INVERT, createEngine } from '../src/main';
import { BuiltInNodeType } from '../src/node';
import { createPreviewCanvas } from './utils';

const backend = await WebGPUBackend.create();

const engine = createEngine({
    backend,
});

engine.registerShader(UNIFORM_COLOR);
engine.registerShader(INVERT);

const graph = engine.loadGraph({
    id: 'test',
    size: 512,
    label: 'Test Graph',
    nodes: {
        // A: {
        //     id: 'A',
        //     type: 'shader',
        //     shader: UNIFORM_COLOR.id,
        //     properties: {
        //         color: createFloat3([1, 0, 0]),
        //     },
        // },
        A: {
            id: 'A',
            type: 'builtin',
            nodeType: BuiltInNodeType.Bitmap,
            properties: {
                source: {
                    type: 'string',
                    value: 'https://placekitten.com/512/512',
                },
            },
        },
        B: {
            id: 'B',
            type: 'shader',
            properties: {},
            shader: INVERT.id,
        },
        C: {
            id: 'C',
            type: 'shader',
            properties: {},
            shader: INVERT.id,
        },
    },
    edges: {
        AB: {
            id: 'AB',
            from: 'A',
            fromPort: 'output',
            to: 'B',
            toPort: 'input',
        },
        BC: {
            id: 'BC',
            from: 'B',
            fromPort: 'output',
            to: 'C',
            toPort: 'input',
        },
    },
});

await engine.renderGraph(graph);

for (const node of graph.iterNodes()) {
    const container = document.createElement('div');
    container.textContent = `${node.id} (${node.shader})`;
    document.body.appendChild(container);

    for (const [outputId, outputTexture] of Object.entries(node.outputs)) {
        const outputContainer = document.createElement('div');
        outputContainer.textContent = `${outputId}`;
        container.appendChild(outputContainer);

        const previewCanvas = createPreviewCanvas(outputContainer);
        backend.renderTexture(outputTexture as any, previewCanvas);
    }
}
