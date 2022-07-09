import type { WebGPUBackend } from '../../src/main';

export {};

declare global {
    interface Window {
        backend: WebGPUBackend;
    }
}
