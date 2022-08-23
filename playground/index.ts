import { WebGPUBackend, createEngine, Graph, SerializedGraph, loadGraph } from '../src/main';

const examples = import.meta.glob<SerializedGraph>('./examples/*.json', {
    as: 'json',
    eager: true,
});

const select = document.querySelector('select')!;
const previewToggle = document.querySelector('#preview-size-toggle') as HTMLInputElement;

const root = document.querySelector('#container')!;

const backend = await WebGPUBackend.create();
const engine = createEngine({
    backend,
});

async function renderExample(id: string) {
    const data = examples[id];
    engine.dispatch(loadGraph(data));

    const graph = engine.getGraph(data.id);

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
        container.textContent = `${node.label} [id: ${node.id}]`;

        root.appendChild(container);

        for (const [outputId, outputTexture] of Object.entries(node.outputs)) {
            const outputContainer = document.createElement('div');
            outputContainer.textContent = `${outputId}`;
            container.appendChild(outputContainer);

            const previewCanvas = createPreviewCanvas(outputContainer);
            backend.renderTexture(outputTexture as any, previewCanvas);
        }
    }
}

function createPreviewCanvas(target: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.className = 'preview';
    target.appendChild(canvas);

    canvas.width = 512;
    canvas.height = 512;

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

        updateQueryString({ id: value });
        renderExample(value);
    });
}

function setupToggle() {
    previewToggle.addEventListener('change', (evt) => {
        const { checked } = evt.target as HTMLInputElement;
        root.classList.toggle('large-preview', checked);
    });
}

function updateQueryString({ id, replace = false }: { id: string; replace?: boolean }) {
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
    setupToggle();

    let example = url.searchParams.get('example');
    if (example) {
        select.value = example;
    } else {
        example = select.value;
        updateQueryString({ id: example, replace: true });
    }

    renderExample(example);
}

run();
