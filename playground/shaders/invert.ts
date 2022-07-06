import { ShaderDescriptor, wgsl } from "../../src/main";

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var val = textureSample(input_texture, input_sampler, coordinate);

        var output = Output();
        output.output = vec4<f32>(val.rbg * vec3<f32>(-1.0) + vec3<f32>(1.0), val.w);
        return output;
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