import { wgsl } from '../utils/wgsl';

import { WebGpuTexture } from './texture';
import { createShaderModule } from './module';
import { ShaderConfig } from './shader-config';
import { VERTEX_SHADER_CODE } from './shader-source';

import type { Value, ShaderDescriptor, CompilerShader, ShaderIOType } from '../types';

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

    console.log(getShaderSource(shader, shaderConfig));

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

    // FIXME: The texture fallback should be shared by all the shaders.
    const textureFallback = device.createTexture({
        format: 'rgba8unorm',
        size: { width: 1, height: 1 },
        usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    const textureFallbackView = textureFallback.createView();

    // FIXME: Isn't single sample necessary for the entire shader?
    const inputSamplers = Object.fromEntries(
        Object.keys(shader.inputs).map((inputId) => {
            return [
                inputId,
                device.createSampler({
                    label: `Input:${id}:${inputId}`,
                    minFilter: 'linear',
                    magFilter: 'linear',
                }),
            ];
        }),
    );

    const inputsBindGroupLayout = device.createBindGroupLayout({
        label: `Inputs:${id}`,
        entries: Object.values(shader.inputs).flatMap((_input, index) => {
            return [
                {
                    binding: index * 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
                {
                    binding: index * 2 + 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
            ];
        }),
    });

    const pipelineLayout = device.createPipelineLayout({
        label: id,
        bindGroupLayouts: [propertiesBindGroupLayout, inputsBindGroupLayout],
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
            attributes: Record<string, Value>,
            inputs: Record<string, WebGpuTexture | null>,
            outputs: Record<string, WebGpuTexture>,
        ): void {
            shaderConfig.writePropertiesBuffer(attributes, properties);

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
                    renderPass.setBindGroup(
                        1,
                        device.createBindGroup({
                            label: `Inputs:${id}`,
                            layout: inputsBindGroupLayout,
                            entries: Object.keys(shader.inputs).flatMap((inputId, index) => {
                                const view = inputs[inputId]?.view ?? textureFallbackView;
                                const sampler = inputSamplers[inputId];

                                return [
                                    {
                                        binding: index * 2,
                                        resource: view,
                                    },
                                    {
                                        binding: index * 2 + 1,
                                        resource: sampler,
                                    },
                                ];
                            }),
                        }),
                    );

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
    const outputStruct = wgsl`
        struct Output {
            ${Object.entries(shader.outputs).map(
                ([key, output], index) =>
                    `@location(${index}) ${key} : ${ioTypeToWgslType(output)},`,
            )}
        }
    `;

    const structBinding = wgsl`@group(0) @binding(0) var<uniform> config: Config;`;
    const inputsBindings = Object.keys(shader.inputs).map(
        (key, index) => wgsl`
        @group(1) @binding(${2 * index}) var ${key}_texture: texture_2d<f32>;
        @group(1) @binding(${2 * index + 1}) var ${key}_sampler: sampler;
    `,
    );

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
