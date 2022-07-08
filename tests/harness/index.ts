import { WebGPUBackend } from '../../src/main';

const backend = await WebGPUBackend.create();

window.backend = backend;
