import { WebGpuTexture } from "./texture";
import { ShaderPipeline } from "./pipeline";

import type { Backend, CompilerShader, ShaderDescriptor, TextureConfig } from "../types";
import { createPreviewRenderer, PreviewRenderer } from "./preview-renderer";

interface WebGPUBackendConfig {
    device: GPUDevice, adapter: GPUAdapter
}

export class WebGPUBackend implements Backend {
    #adapter: GPUAdapter;
    #device: GPUDevice;
    #canvasTextureFormat: GPUTextureFormat;
    #canvasContext = new WeakMap<HTMLCanvasElement, GPUCanvasContext>();
    #previewRenderer: PreviewRenderer;

    constructor(config: WebGPUBackendConfig) {
        this.#device = config.device;
        this.#adapter = config.adapter;

        this.#canvasTextureFormat = navigator.gpu.getPreferredCanvasFormat();
        this.#previewRenderer = createPreviewRenderer(this.#device, {
            format: this.#canvasTextureFormat,
        });
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
    
    createTexture(config: TextureConfig): WebGpuTexture {
        return new WebGpuTexture(this.#device, {
            ...config,
        });
    }

    async compileShader(descriptor: ShaderDescriptor): Promise<CompilerShader> {
        return new ShaderPipeline(this.#device, descriptor);
    }

    renderTexture(texture: WebGpuTexture, canvas: HTMLCanvasElement) {
        let context = this.#canvasContext.get(canvas);
        
        if (context === undefined) {
            context = canvas.getContext('webgpu')!;
            this.#canvasContext.set(canvas, context);
            
            context.configure({
                device: this.#device,
                format: this.#canvasTextureFormat,
                alphaMode: 'opaque'
            });
        }

        this.#previewRenderer.render({
            source: texture.gpuTexture,
            target: context.getCurrentTexture(),
        })
    }

    waitUntilDone(): Promise<void> {
        return this.#device.queue.onSubmittedWorkDone();
    }
}