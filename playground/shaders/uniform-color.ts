import { ShaderDescriptor, wgsl } from "../../src/main";

const UNIFORM_COLOR_SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var color = vec3<f32>(config.color);

        var output = Output();
        output.output = vec4<f32>(color, 1.0);
        return output;
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