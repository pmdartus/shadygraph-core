import { WebGpuTexture } from './texture';
import { createCompiledShader } from './pipeline';
import { createPreviewRenderer, PreviewRenderer } from './preview-renderer';

import type {
    Backend,
    CompiledShader,
    ShaderNodeDescriptor,
    Texture,
    TextureConfig,
} from '../types';

interface WebGPUBackendConfig {
    device: GPUDevice;
    adapter: GPUAdapter;
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
            adapter,
        });
    }

    createTexture(config: TextureConfig): WebGpuTexture {
        return new WebGpuTexture(this.#device, {
            ...config,
        });
    }

    copyImageToTexture(source: ImageBitmap, texture: Texture): void {
        this.#device.queue.copyExternalImageToTexture(
            { source },
            { texture: (texture as WebGpuTexture).gpuTexture },
            {
                width: source.width,
                height: source.height,
            },
        );
    }

    async compileShader(descriptor: ShaderNodeDescriptor): Promise<CompiledShader> {
        return createCompiledShader(this.#device, descriptor);
    }

    renderTexture(texture: WebGpuTexture, canvas: HTMLCanvasElement) {
        let context = this.#canvasContext.get(canvas);

        if (context === undefined) {
            context = canvas.getContext('webgpu')!;
            this.#canvasContext.set(canvas, context);

            context.configure({
                device: this.#device,
                format: this.#canvasTextureFormat,
                alphaMode: 'opaque',
            });
        }

        this.#previewRenderer.render({
            source: texture,
            target: context.getCurrentTexture(),
        });
    }

    waitUntilDone(): Promise<void> {
        return this.#device.queue.onSubmittedWorkDone();
    }
}
