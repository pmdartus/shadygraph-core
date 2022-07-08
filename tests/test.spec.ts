import * as path from 'path';
import { fileURLToPath } from 'node:url';

import { createServer, ViteDevServer } from 'vite';
import { afterAll, beforeAll, expect, test } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

import { UNIFORM_COLOR } from '../src/main';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9876;
const harnessDirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './harness');

async function initHarness(): Promise<ViteDevServer> {
    const server = await createServer({
        configFile: false,
        root: harnessDirname,
    });

    await server.listen(PORT);
    return server;
}

async function initPuppeteer(): Promise<{ page: Page; browser: Browser }> {
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

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
    server = await initHarness();

    const res = await initPuppeteer();
    browser = res.browser;
    page = res.page;
});

afterAll(async () => {
    await server.close();
    await browser.close();
});

test('should work as expected', async () => {
    const compiledShader = await page.evaluateHandle(
        (shader) => window.backend.compileShader(shader),
        UNIFORM_COLOR,
    );

    await page.evaluate(async (compiledShader) => {
        const output = window.backend.createTexture({ size: 512, type: 'color' });
        compiledShader.render(
            {
                color: { type: 'float3', value: [0.5, 0.5, 0.2] },
            },
            {},
            { output },
        );

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        document.body.appendChild(canvas);

        backend.renderTexture(output, canvas);
        await backend.waitUntilDone();
    }, compiledShader);

    const canvas = await page.$('canvas');
    await canvas!.screenshot({
        type: 'png',
        path: './screenshot.png',
    });
});
