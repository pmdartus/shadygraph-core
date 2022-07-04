import { ShaderDescriptor } from "../../src/main";

const UNIFORM_COLOR_SOURCE = /* wgsl */ `
    struct UniformColorConfig {
        @location(0) color: vec3<f32>,
    };

    struct UniformColorOutput {
        @location(0) output: vec4<f32>,
    };

    @group(0) @binding(0) var<uniform> config: UniformColorConfig;

    @fragment
    fn main(
        @location(0) coordinate: vec2<f32>
    ) -> UniformColorOutput {
        var color = vec3<f32>(config.color);
        return UniformColorOutput(vec4<f32>(color, 1.0));
    }
`;

export const UNIFORM_COLOR: ShaderDescriptor = {
    id: '#uniform-color',
    label: 'Uniform Color',
    source: UNIFORM_COLOR_SOURCE,
    properties: {
        color: {
            label: 'Color',
            type: 'float3',
            description: 'Set the color returned as output.',
            default: [0.5, 0.5, 0.5],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
};