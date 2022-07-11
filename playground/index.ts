import { WebGPUBackend, createFloat3, UNIFORM_COLOR, INVERT, createEngine } from '../src/main';
import { createPreviewCanvas } from './utils';

const backend = await WebGPUBackend.create();

const engine = createEngine({
    backend,
});

engine.registerShader(UNIFORM_COLOR);
engine.registerShader(INVERT);

const graph = engine.loadGraph({
    id: 'test',
    nodes: {
        A: {
            id: 'A',
            properties: {
                color: createFloat3([1, 0, 0]),
            },
            shader: UNIFORM_COLOR.id,
        },
        B: {
            id: 'B',
            properties: {},
            shader: INVERT.id,
        },
        C: {
            id: 'C',
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
