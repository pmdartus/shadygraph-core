import { FRAGMENT_SHADER_FULLSCREEN_CODE, VERTEX_SHADER_CODE } from './shader-source';

interface PreviewRendererConfig {
    format: GPUTextureFormat;
}

export interface PreviewRenderer {
    render(config: { source: GPUTexture; target: GPUTexture }): void;
}

export function createPreviewRenderer(
    device: GPUDevice,
    config: PreviewRendererConfig,
): PreviewRenderer {
    const inputLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {},
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {},
            },
        ],
    });

    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [inputLayout],
        }),
        vertex: {
            module: device.createShaderModule({
                code: VERTEX_SHADER_CODE,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: FRAGMENT_SHADER_FULLSCREEN_CODE,
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
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [
                    {
                        view: target.createView(),
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
            };

            const commandEncoder = device.createCommandEncoder();

            const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
            renderPass.setPipeline(pipeline);
            renderPass.setBindGroup(
                0,
                device.createBindGroup({
                    layout: inputLayout,
                    entries: [
                        {
                            binding: 0,
                            resource: source.createView(),
                        },
                        {
                            binding: 1,
                            resource: device.createSampler({}),
                        },
                    ],
                }),
            );
            renderPass.draw(6, 1, 0, 0);
            renderPass.end();

            const command = commandEncoder.finish();

            device.queue.submit([command]);
        },
    };
}
