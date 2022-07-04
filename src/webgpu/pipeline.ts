import { WebGpuTexture } from './texture';
import { createShaderModule } from './module';
import { PropertiesBuffer } from './properties';
import { VERTEX_SHADER_CODE } from './shader-source';

import type { Value, TextureType, ShaderDescriptor, CompilerShader } from '../types';

interface ShaderPipelineInput {
    id: string;
    texture: WebGpuTexture;
    sampler: GPUSampler;
    layout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;
}

interface ShaderPipelineOutput {
    id: string;
    texture: WebGpuTexture;
}

interface ShaderPipelineState {
    pipeline: GPURenderPipeline;
    properties: PropertiesBuffer;
    inputs: ShaderPipelineInput[];
    outputs: ShaderPipelineOutput[];
    bindGroups: GPUBindGroup[];
}

const TEXTURE_TYPE: TextureType = 'color';
const TEXTURE_SIZE = 512;

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
        label: `BindGroupLayout:Properties:${id}`,
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
        label: `BindGroup:Properties:${id}`,
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

    const pipelineInputs = Object.keys(shader.inputs).map((inputId) =>
        createShaderInput(device, shader, inputId),
    );
    const pipelineOutputs = Object.keys(shader.outputs).map((outputId) =>
        createShaderOutput(device, shader, outputId),
    );

    const pipelineLayout = device.createPipelineLayout({
        label: `PipelineLayout:${id}`,
        bindGroupLayouts: [propertiesBindGroupLayout, ...pipelineInputs.map((input) => input.layout)],
    });

    const bindGroups: GPUBindGroup[] = [
        propertiesBindGroup,
        ...pipelineInputs.map((input) => input.bindGroup),
    ];

    const pipeline = await device.createRenderPipelineAsync({
        label: `RenderPipeline:${id}`,
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
        async render(
            properties: Record<string, Value>,
            inputs: Record<string, WebGpuTexture>,
            outputs: Record<string, WebGpuTexture>,
        ): Promise<void> {    
            propertiesBuffer.writePropertiesBuffer(properties);
    
            const encoder = device.createCommandEncoder();
            {
                for (const input of pipelineInputs) {
                    const inputTexture = inputs[input.id];
    
                    if (inputTexture !== undefined) {
                        // If present copy the input texture to the pipeline texture.
                        //
                        // TODO: Do we really need to copy the, could we plug it into the pipeline directly?
                        // Wouldn't it be faster this way?
                        WebGpuTexture.copyTextureToTexture(encoder, inputTexture, input.texture);
                    } else {
                        // Otherwise clear the pipeline texture to remove the previous result.
                        input.texture.clear();
                    }
                }
    
                const renderPass = encoder.beginRenderPass({
                    colorAttachments: pipelineOutputs.map((output) => ({
                        view: output.texture.view,
                        loadValue: { r: 0, g: 0, b: 0, a: 1 },
                        loadOp: 'clear',
                        storeOp: 'store',
                    })),
                });
    
                {
                    renderPass.setPipeline(pipeline);
                    for (let i = 0; i < bindGroups.length; i++) {
                        renderPass.setBindGroup(i, bindGroups[i]);
                    }
                    renderPass.draw(6, 1, 0, 0);
                    renderPass.end();
                }
    
                for (const output of pipelineOutputs) {
                    const outputTexture = outputs[output.id];
                    if (outputTexture === undefined) {
                        throw new Error(`Output texture "${output.id}" missing.`);
                    }
    
                    WebGpuTexture.copyTextureToTexture(encoder, output.texture, outputTexture);
                }
            }
    
            const command = encoder.finish();
    
            device.queue.submit([command]);
        },

        destroy() {
            propertiesBuffer.destroy();
            pipelineInputs.forEach((input) => input.texture.destroy());
            pipelineOutputs.forEach((output) => output.texture.destroy());
        },
    }
}

function createShaderInput(
    device: GPUDevice,
    shader: ShaderDescriptor,
    inputId: string,
): ShaderPipelineInput {
    const { id } = shader;

    const texture = new WebGpuTexture(device, {
        label: `${id}:${inputId}`,
        type: TEXTURE_TYPE,
        size: TEXTURE_SIZE,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const view = texture.view;

    const sampler = device.createSampler({
        label: `Sampler:Input:${id}:${inputId}`,
        minFilter: 'linear',
        magFilter: 'linear',
    });

    const layout = device.createBindGroupLayout({
        label: `BindGroupLayout:Input:${id}:${inputId}`,
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

    const bindGroup = device.createBindGroup({
        label: `BindGroup:Input:${id}:${inputId}`,
        layout,
        entries: [
            {
                binding: 0,
                resource: view,
            },
            {
                binding: 1,
                resource: sampler,
            },
        ],
    });

    return {
        id: inputId,
        texture,
        sampler,
        layout,
        bindGroup,
    };
}

function createShaderOutput(
    device: GPUDevice,
    shader: ShaderDescriptor,
    outputId: string,
): ShaderPipelineOutput {
    const { id } = shader;

    const texture = new WebGpuTexture(device, {
        label: `Texture:Output:${id}:${outputId}`,
        type: TEXTURE_TYPE,
        size: TEXTURE_SIZE,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    return {
        id: outputId,
        texture,
    };
}
