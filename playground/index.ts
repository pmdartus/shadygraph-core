import {
    WebGPUBackend,
    UNIFORM_COLOR,
    INVERT,
    createEngine,
    Graph,
    SerializedGraph,
} from '../src/main';
import { createPreviewCanvas } from './utils';

const select = document.querySelector('select')!;
const root = document.querySelector('#container')!;

const backend = await WebGPUBackend.create();

const engine = createEngine({
    backend,
});

engine.registerShader(UNIFORM_COLOR);
engine.registerShader(INVERT);

async function fetchGraph(id: string): Promise<SerializedGraph> {
    const response = await fetch(`/examples/${id}.json`);
    return response.json();
}

async function renderExample(id: string) {
    const data = await fetchGraph(id);
    const graph = engine.loadGraph(data);

    await engine.renderGraph(graph);

    renderPreviews(graph);
}

function renderPreviews(graph: Graph) {
    while (root.firstChild) {
        root.firstChild.remove();
    }

    for (const node of graph.iterNodes()) {
        const container = document.createElement('div');
        if (node.type === 'shader') {
            container.textContent = `${node.id} (shader: ${node.shader})`;
        } else if (node.type === 'builtin') {
            container.textContent = `${node.id} (type: ${node.nodeType})`;
        }

        root.appendChild(container);

        for (const [outputId, outputTexture] of Object.entries(node.outputs)) {
            const outputContainer = document.createElement('div');
            outputContainer.textContent = `${outputId}`;
            container.appendChild(outputContainer);

            const previewCanvas = createPreviewCanvas(outputContainer, 128);
            backend.renderTexture(outputTexture as any, previewCanvas);
        }
    }
}

function updateQueyString({ id, replace = false }: { id: string; replace?: boolean }) {
    const updatedUrl = new URL(window.location.href);
    updatedUrl.searchParams.set('example', id);

    if (replace) {
        window.history.replaceState({}, '', updatedUrl);
    } else {
        window.history.pushState({}, '', updatedUrl);
    }
}

function run() {
    const url = new URL(window.location.href);

    let example = url.searchParams.get('example');
    if (example) {
        select.value = example;
    } else {
        example = select.value;
        updateQueyString({ id: example, replace: true });
    }

    select.addEventListener('change', () => {
        const { value } = select;

        updateQueyString({ id: value });
        renderExample(value);
    });

    renderExample(example);
}

run();
