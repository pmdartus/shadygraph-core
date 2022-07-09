import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { ShaderDescriptor, UNIFORM_COLOR, Value } from '../../src/main';
import { createHarness, TestHarness } from '../utils';

let harness: TestHarness;

beforeAll(async () => {
    harness = await createHarness();
});

beforeEach(async () => {
    await harness.reset();
});

afterAll(async () => {
    await harness.close();
});

function testShader(shader: ShaderDescriptor, tests: Record<string, Record<string, Value>>) {
    describe(shader.id, () => {
        for (const [name, props] of Object.entries(tests)) {
            test(name, async () => {
                const { page } = harness;

                const compiledShader = await page.evaluateHandle(
                    (shader) => window.backend.compileShader(shader),
                    UNIFORM_COLOR,
                );

                await page.evaluate(
                    async (compiledShader, props) => {
                        const output = window.backend.createTexture({ size: 512, type: 'color' });
                        compiledShader.render(props, {}, { output });

                        const canvas = document.createElement('canvas');
                        canvas.width = 512;
                        canvas.height = 512;
                        document.body.appendChild(canvas);

                        window.backend.renderTexture(output, canvas);
                        await window.backend.waitUntilDone();
                    },
                    compiledShader,
                    props,
                );

                const canvas = await page.$('canvas');
                const actualTexture = (await canvas!.screenshot({
                    type: 'png',
                })) as Buffer;

                await expect(actualTexture).toMatchImageSnapshot({
                    name: `${shader.id}-${name}`,
                });
            });
        }
    });
}

testShader(UNIFORM_COLOR, {
    'gray-color': {
        color: { type: 'float3', value: [0.5, 0.5, 0.5] },
    },
    red: {
        color: { type: 'float3', value: [1, 0, 0] },
    },
});
