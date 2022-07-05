import { ShaderDescriptor } from "../../src/main";

const SOURCE = /* wgsl */ `
    struct InvertConfig {
        @location(0) enabled: u32,
    };

    struct InvertOutput {
        @location(0) output: vec4<f32>,
    };

    @group(0) @binding(0) var<uniform> config: InvertConfig;
    @group(1) @binding(0) var input_texture: texture_2d<f32>;
    @group(1) @binding(1) var input_sampler: sampler;

    @fragment
    fn main(
        @location(0) coordinate: vec2<f32>,
    ) -> InvertOutput {
        var val = textureSample(input_texture, input_sampler, coordinate);
        var inverted = vec4<f32>(val.rbg * vec3<f32>(-1.0) + vec3<f32>(1.0), val.w);
        return InvertOutput(inverted);
    }
`;

export const INVERT: ShaderDescriptor = {
    id: '#invert',
    label: 'Invert',
    source: SOURCE,
    properties: {
        enabled: {
            label: 'Enabled',
            type: 'boolean',
            description: 'Does invert the input if enabled.',
            default: true,
        },
    },
    inputs: {
        input: {
            label: 'Input',
            type: 'color',
        },
    },
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
};