import { wgsl } from '../utils/wgsl';

import { WebGpuTexture } from './texture';
import { createShaderModule } from './module';
import { ShaderConfig } from './shader-config';
import { VERTEX_SHADER_CODE } from './shader-source';

import type { Value, ShaderDescriptor, CompilerShader, PropertyType, ShaderIOType } from '../types';
import { createFloat1 } from '../value';

export async function createCompiledShader(
    device: GPUDevice,
    shader: ShaderDescriptor,
): Promise<CompilerShader> {
    const { id } = shader;

    const shaderConfig = ShaderConfig.create(device, shader);

    const vertexShaderModule = await createShaderModule(device, {
        label: `ShaderModule:Vertex:${id}`,
        code: VERTEX_SHADER_CODE,
    });

    const fragmentShaderModule = await createShaderModule(device, {
        label: `ShaderModule:Fragment:${id}`,
        code: getShaderSource(shader, shaderConfig),
    });

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
                    buffer: shaderConfig.buffer,
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
            targets: Object.values(shader.outputs).map((outputType) => ({
                format: ioTypeToTextureFormat(outputType),
            })),
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
            shaderConfig.writePropertiesBuffer(
                {
                    seed: createFloat1([0]),
                },
                properties,
            );

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
                        // TODO: Handle cases where the input is not provided.
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
            shaderConfig.destroy();
        },
    };
}

function getShaderSource(shader: ShaderDescriptor, config: ShaderConfig): string {
    const configStruct = config.toWgsl();
    const structBinding = wgsl`@group(0) @binding(0) var<uniform> config: Config;`;

    const inputsBindings = Object.keys(shader.inputs).map(
        (key, index) => wgsl`
        @group(${index + 1}) @binding(0) var ${key}_texture: texture_2d<f32>;
        @group(${index + 1}) @binding(1) var ${key}_sampler: sampler;
    `,
    );

    const outputStruct = wgsl`
        struct Output {
            ${Object.entries(shader.outputs).map(
                ([key, output], index) =>
                    `@location(${index}) ${key} : ${ioTypeToWgslType(output)},`,
            )}
        }
    `;

    return wgsl`
        ${configStruct}
        ${outputStruct}

        ${structBinding}
        ${inputsBindings}

        ${shader.source}

        @fragment
        fn main(@location(0) coordinate: vec2<f32>) -> Output {
            return run(coordinate);
        }
    `;
}

function ioTypeToWgslType(ioType: ShaderIOType): string {
    switch (ioType.type) {
        case 'grayscale':
            return 'f32';
        case 'color':
            return 'vec4<f32>';
    }
}

function ioTypeToTextureFormat(ioType: ShaderIOType): GPUTextureFormat {
    switch (ioType.type) {
        case 'grayscale':
            return 'r8unorm';
        case 'color':
            return 'rgba8unorm';
    }
}
