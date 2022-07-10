import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer, ViteDevServer } from 'vite';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { ShaderDescriptor, Value } from '../src/main';

export interface TestHarness {
    server: ViteDevServer;
    page: Page;
    browser: Browser;

    reset(): Promise<void>;
    close(): Promise<void>;
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9876;

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const harnessDirname = path.resolve(currentDir, './harness');

async function createDevServer(): Promise<ViteDevServer> {
    const server = await createServer({
        configFile: false,
        root: harnessDirname,
    });

    await server.listen(PORT);
    return server;
}

async function createPuppeteer(): Promise<{ page: Page; browser: Browser }> {
    let extraArgs = {};

    if (process.env.DEBUG) {
        extraArgs = {
            headless: false,
            devtools: true,
            slowMo: 250,
        };
    }

    const browser = await puppeteer.launch({
        ...extraArgs,
        args: [
            '--enable-unsafe-webgpu', // Enable WebGPU
            '--use-gl=egl', // Enable GPU acceleration
            '--no-sandbox', // Disable process sandboxing
        ],
    });

    const page = await browser.newPage();
    if (process.env.DEBUG) {
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
        page.on('error', (error) => console.error('PAGE ERROR:', error));
    }

    await page.goto(`http://localhost:${PORT}/`);

    return { browser, page };
}

export async function createHarness(): Promise<TestHarness> {
    const server = await createDevServer();
    const { browser, page } = await createPuppeteer();

    return {
        server,
        browser,
        page,

        async reset() {
            await page.reload();
        },

        async close() {
            await Promise.all([browser.close(), server.close()]);
        },
    };
}

export function testShader(shader: ShaderDescriptor, tests: Record<string, Record<string, Value>>) {
    describe(shader.id, () => {
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

        for (const [name, props] of Object.entries(tests)) {
            test(name, async () => {
                const { page } = harness;

                await page.evaluate(
                    async (shader, props) => {
                        const compiledShader = await window.backend.compileShader(shader);

                        const output = window.backend.createTexture({
                            size: 512,
                            type: shader.outputs.output.type,
                        });
                        compiledShader.render(props, {}, { output });

                        const canvas = document.createElement('canvas');
                        canvas.width = 512;
                        canvas.height = 512;
                        document.body.appendChild(canvas);

                        window.backend.renderTexture(output, canvas);
                        await window.backend.waitUntilDone();
                    },
                    shader,
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
