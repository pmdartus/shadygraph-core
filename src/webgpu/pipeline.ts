import { WebGpuTexture } from './texture';
import { createShaderModule } from './module';
import { PropertiesBuffer } from './properties';
import { VERTEX_SHADER_CODE } from './shader-source';

import type { Value, ShaderDescriptor, CompilerShader } from '../types';

interface ShaderPipelineInput {
    id: string;
    sampler: GPUSampler;
    layout: GPUBindGroupLayout;
}

export async function createCompiledShader(
    device: GPUDevice,
    shader: ShaderDescriptor,
): Promise<CompilerShader> {
    const { id } = shader;

    const vertexShaderModule = await createShaderModule(device, {
        label: `ShaderModule:Vertex:${id}`,
        code: VERTEX_SHADER_CODE,
    });

    const fragmentShaderModule = await createShaderModule(device, {
        label: `ShaderModule:Fragment:${id}`,
        code: shader.source,
    });

    const propertiesBuffer = new PropertiesBuffer(device, shader);

    const propertiesBindGroupLayout = device.createBindGroupLayout({
        label: `Properties:${id}`,
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform',
                },
            },
        ],
    });

    const propertiesBindGroup = device.createBindGroup({
        label: `Properties:${id}`,
        layout: propertiesBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: propertiesBuffer.buffer,
                },
            },
        ],
    });

    const pipelineInputs = Object.keys(shader.inputs).map((inputId) => {
        const sampler = device.createSampler({
            label: `Input:${id}:${inputId}`,
            minFilter: 'linear',
            magFilter: 'linear',
        });

        const layout = device.createBindGroupLayout({
            label: `Input:${id}:${inputId}`,
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

        return {
            id: inputId,
            sampler,
            layout,
        };
    });

    const pipelineLayout = device.createPipelineLayout({
        label: id,
        bindGroupLayouts: [
            propertiesBindGroupLayout,
            ...pipelineInputs.map((input) => input.layout),
        ],
    });

    const pipeline = await device.createRenderPipelineAsync({
        label: id,
        layout: pipelineLayout,
        vertex: {
            module: vertexShaderModule,
            entryPoint: 'main',
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: 'main',
            targets: [
                {
                    format: 'rgba8unorm',
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    return {
        render(
            properties: Record<string, Value>,
            inputs: Record<string, WebGpuTexture>,
            outputs: Record<string, WebGpuTexture>,
        ): void {
            propertiesBuffer.writePropertiesBuffer(properties);

            const encoder = device.createCommandEncoder();
            {
                const renderPass = encoder.beginRenderPass({
                    colorAttachments: Object.keys(shader.outputs).map((id) => ({
                        view: outputs[id].view,
                        loadOp: 'clear',
                        storeOp: 'store',
                    })),
                });

                {
                    renderPass.setPipeline(pipeline);
                    renderPass.setBindGroup(0, propertiesBindGroup);
                    for (let i = 0; i < pipelineInputs.length; i++) {
                        renderPass.setBindGroup(
                            i + 1,
                            device.createBindGroup({
                                layout: pipelineInputs[i].layout,
                                entries: [
                                    {
                                        binding: 0,
                                        resource: inputs[pipelineInputs[i].id].view,
                                    },
                                    {
                                        binding: 1,
                                        resource: pipelineInputs[i].sampler,
                                    },
                                ],
                            }),
                        );
                    }

                    renderPass.draw(6, 1, 0, 0);
                    renderPass.end();
                }
            }

            const command = encoder.finish();
            device.queue.submit([command]);
        },

        destroy() {
            propertiesBuffer.destroy();
        },
    };
}
