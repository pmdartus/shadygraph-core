import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var val = textureSample(input_texture, input_sampler, coordinate).r;
        return Output(vec4<f32>(val, val, val, 1.0));
    }
`;

export default createShaderDescriptor({
    id: '#grayscale-to-color',
    label: 'Grayscale to Color',
    source: SOURCE,
    properties: {},
    inputs: {
        input: {
            label: 'Input',
            type: 'grayscale',
        },
    },
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
});
