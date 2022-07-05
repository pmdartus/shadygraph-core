import { WebGPUBackend, createFloat3 } from '../src/main';

import { createPreviewCanvas } from './utils';
import { UNIFORM_COLOR } from './shaders/uniform-color';
import { INVERT } from './shaders/invert';

const button = document.createElement('button');
document.body.appendChild(button);
button.textContent = 'Run';
button.addEventListener('click', run);

const backend = await WebGPUBackend.create();

const uniformShader = await backend.compileShader(UNIFORM_COLOR);
const invertShader = await backend.compileShader(INVERT);

const uniformNode = {
    shader: uniformShader,
    canvas: createPreviewCanvas(),
    properties: {
        get color() {return  createFloat3([Math.random(), Math.random(), Math.random()]) },
    },
    inputs: {},
    outputs: {
        output: backend.createTexture({ size: 512, type: 'color' }),
    },
};

let currentOutput = uniformNode.outputs.output;

const entries = new Array(1000).fill(null).map((_, i) => {
    const invertOutput = backend.createTexture({ size: 512, type: 'color' });

    const invertNode = {
        shader: invertShader,
        canvas: createPreviewCanvas(),
        properties: {
            enabled: true,
        },
        inputs: {
            input: currentOutput,
        },
        outputs: {
            output: invertOutput,
        }
    };

    currentOutput = invertOutput;
    return invertNode;
});

const nodes = [uniformNode, ...entries];

async function run() {
    const start = performance.now();

    for (const node of nodes) {
        node.shader.render(node.properties as any, node.inputs, node.outputs);
        backend.renderTexture(node.outputs.output, node.canvas);
    }

    await backend.waitUntilDone();
    const end = performance.now();

    button.textContent = `Run (${Math.round(end - start)}ms)`;
}

run();
