import { Texture, TextureConfig, TextureType } from '../types';

export interface WebGPUTextureConfig extends TextureConfig {
    label?: string;
    usage?: GPUTextureUsageFlags;
}

export class WebGpuTexture implements Texture {
    #device: GPUDevice;
    #label: string | undefined;
    #type: TextureType;
    #size: number;
    #texture: GPUTexture;
    #view: GPUTextureView | undefined;

    constructor(
        device: GPUDevice,
        {
            label,
            size,
            usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
            type = 'color',
        }: WebGPUTextureConfig,
    ) {
        this.#device = device;
        this.#label = label;
        this.#type = type;
        this.#size = size;

        const format = type === 'color' ? 'rgba8unorm' : 'r8unorm';
        this.#texture = device.createTexture({
            label,
            size: { width: size, height: size },
            format,
            usage,
        });
    }

    get view() {
        let view = this.#view;

        if (!view) {
            view = this.#view = this.#texture.createView({
                label: this.#label,
            });
        }

        return view;
    }

    get type(): TextureType {
        return this.#type;
    }

    get size(): number {
        return this.#size;
    }

    get gpuTexture(): GPUTexture {
        return this.#texture;
    }

    get #extent3DStrict(): GPUExtent3DStrict {
        return {
            width: this.#size,
            height: this.#size,
        };
    }

    async getData(): Promise<ArrayBuffer> {
        const { size, type } = this;
        const bytesPerPixel = type === 'color' ? 4 : 1;

        // Create a new buffer to read back the texture information.
        const buffer = this.#device.createBuffer({
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            size: bytesPerPixel * size ** 2,
        });

        // Copy data from the texture to the buffer.
        const encoder = this.#device.createCommandEncoder();
        encoder.copyTextureToBuffer(
            { texture: this.#texture },
            { buffer, bytesPerRow: size * bytesPerPixel, rowsPerImage: size },
            this.#extent3DStrict,
        );
        this.#device.queue.submit([encoder.finish()]);

        // Get the data on the CPU and create a copy of it.
        await buffer.mapAsync(GPUMapMode.READ);
        const data = buffer.getMappedRange().slice(0);
        buffer.unmap();

        return data;
    }

    clear() {
        const { size, type } = this;
        const bytesPerPixel = type === 'color' ? 4 : 1;

        this.#device.queue.writeTexture(
            { texture: this.#texture },
            new ArrayBuffer(0),
            { bytesPerRow: size * bytesPerPixel, rowsPerImage: size },
            this.#extent3DStrict,
        );
    }

    destroy() {
        this.#texture.destroy();
    }
}
