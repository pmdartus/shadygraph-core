import { wgsl } from '../utils/wgsl';
import { VERTEX_SHADER_CODE } from './shader-source';

import type { TextureType } from '../types';
import { WebGpuTexture } from './texture';

interface PreviewRendererConfig {
    format: GPUTextureFormat;
}

const TEXTURE_TYPE_MAPPING: { [type in TextureType]: number } = {
    grayscale: 0,
    color: 1,
};

const FRAGMENT_SHADER = wgsl`
    struct Config {
        @location(0) textureType: u32,
    }

    @group(0) @binding(0) var<uniform> config: Config;
    @group(0) @binding(1) var input_texture: texture_2d<f32>;
    @group(0) @binding(2) var input_sampler: sampler;

    @fragment
    fn main(@location(0) coordinate: vec2<f32>) -> @location(0) vec4<f32> {
        var value = textureSample(input_texture, input_sampler, coordinate);

        // Convert grayscale to RGB if necessary.
        if (config.textureType == ${TEXTURE_TYPE_MAPPING.grayscale}) {
            value = value.rrra;
        }

        return value;
    }
`;

export interface PreviewRenderer {
    render(config: { source: WebGpuTexture; target: GPUTexture }): void;
}

export function createPreviewRenderer(
    device: GPUDevice,
    config: PreviewRendererConfig,
): PreviewRenderer {
    const configBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: VERTEX_SHADER_CODE,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: FRAGMENT_SHADER,
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: config.format,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    return {
        render({ source, target }) {
            const configData = new Uint32Array([source.type === 'color' ? 1 : 0]);
            device.queue.writeBuffer(configBuffer, 0, configData);

            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [
                    {
                        view: target.createView(),
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
            };

            const bindGroup = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: configBuffer,
                        },
                    },
                    {
                        binding: 1,
                        resource: source.view,
                    },
                    {
                        binding: 2,
                        resource: device.createSampler({}),
                    },
                ],
            });

            const commandEncoder = device.createCommandEncoder();

            const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
            renderPass.setPipeline(pipeline);
            renderPass.setBindGroup(0, bindGroup);
            renderPass.draw(6, 1, 0, 0);
            renderPass.end();

            const command = commandEncoder.finish();

            device.queue.submit([command]);
        },
    };
}
