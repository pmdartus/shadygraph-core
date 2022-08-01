import { WebGPUBackend, createEngine, Graph, SerializedGraph } from '../src/main';

const examples = import.meta.glob<SerializedGraph>('./examples/*.json', {
    as: 'json',
    eager: true,
});

const select = document.querySelector('select')!;
const root = document.querySelector('#container')!;

const backend = await WebGPUBackend.create();
const engine = createEngine({
    backend,
});

async function renderExample(id: string) {
    const data = examples[id];
    const graph = engine.loadGraph(data);

    console.log(`Loaded graph: ${id}`);

    await engine.renderGraph(graph);

    console.log(`Rendered graph: ${id}`);

    renderPreviews(graph);
}

function renderPreviews(graph: Graph) {
    while (root.firstChild) {
        root.firstChild.remove();
    }

    for (const node of graph.iterNodes()) {
        const container = document.createElement('div');
        container.textContent = node.toString();

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

function createPreviewCanvas(target: HTMLElement, size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    target.appendChild(canvas);

    canvas.width = 512;
    canvas.height = 512;

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    return canvas;
}

function setupSelectDropdown() {
    for (const [key, value] of Object.entries(examples)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = (value as any).label;
        select.appendChild(option);
    }
    select.firstElementChild?.setAttribute('selected', '');

    select.addEventListener('change', () => {
        const { value } = select;

        updateQueyString({ id: value });
        renderExample(value);
    });
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

    setupSelectDropdown();

    let example = url.searchParams.get('example');
    if (example) {
        select.value = example;
    } else {
        example = select.value;
        updateQueyString({ id: example, replace: true });
    }

    renderExample(example);
}

run();
