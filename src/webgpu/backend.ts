import { WebGpuTexture } from "./texture";
import { ShaderPipeline } from "./pipeline";

import type { Backend, CompilerShader, ShaderDescriptor, TextureConfig } from "../types";

interface WebGPUBackendConfig {
    device: GPUDevice, adapter: GPUAdapter
}

export class WebGPUBackend implements Backend {
    #adapter: GPUAdapter;
    #device: GPUDevice;

    constructor(config: WebGPUBackendConfig) {
        this.#device = config.device;
        this.#adapter = config.adapter;
    }

    static async create(): Promise<WebGPUBackend> {
        if (!('gpu' in navigator)) {
            throw new Error('GPU not supported in this browser.');
        }
        
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance',
        });
        
        if (adapter === null) {
            throw new Error('Failed to instantiate GPU adapter.');
        }

        const device = await adapter.requestDevice();

        return new WebGPUBackend({
            device,
            adapter
        });
    }

    async compileShader(descriptor: ShaderDescriptor): Promise<CompilerShader> {
        return new ShaderPipeline(this.#device, descriptor);
    }

    createTexture(config: TextureConfig): WebGpuTexture {
        return new WebGpuTexture(this.#device, {
            ...config,
        });
    }
}