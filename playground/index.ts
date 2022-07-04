import { WebGPUBackend, createFloat3 } from '../src/main';

import { UNIFORM_COLOR } from './shaders/uniform-color';
import { textureToCanvas } from './utils';

const backend = await WebGPUBackend.create();

const compiledShader = await backend.compileShader(UNIFORM_COLOR);

async function run() {
    document.querySelectorAll('canvas').forEach((canvas) => canvas.remove());

    const entries = new Array(100).fill(null).map((_, i) => {
        const canvas = document.createElement('canvas');
        canvas.style.width = `30px`;
        document.body.appendChild(canvas);

        return {
            color: createFloat3([Math.random(), Math.random(), Math.random()]),
            output: backend.createTexture({ size: 512, type: 'color' }),
            canvas,
        };
    });

    const start = performance.now();

    await Promise.all(
        entries.map(async ({ canvas, color, output }) => {
            const properties = { color };
            const inputs = {};
            const outputs = { output };

            await compiledShader.render(properties, inputs, outputs);
            return textureToCanvas(output, canvas);
        }),
    );

    const end = performance.now();

    button.textContent = `Run (${Math.round(end - start)}ms)`;
}

const button = document.createElement('button');
document.body.appendChild(button);
button.textContent = 'Run';
button.addEventListener('click', run);

run();
