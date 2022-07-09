import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer, ViteDevServer } from 'vite';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

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
