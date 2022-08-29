/* eslint-env node */

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'ShadyGraph',
            fileName: 'shadygraph',
        },
        minify: false,
        target: 'esnext',
    },
});
