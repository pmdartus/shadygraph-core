import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var value = textureSample(input_texture, input_sampler, coordinate);
        return Output(value.r, value.g, value.b, value.a);
    }
`;

export default createShaderDescriptor({
    id: '#rgba-split',
    label: 'RGBA Split',
    source: SOURCE,
    properties: {},
    inputs: {
        input: {
            label: 'Input',
            type: 'color',
        },
    },
    outputs: {
        red: {
            label: 'Red',
            type: 'grayscale',
        },
        green: {
            label: 'Green',
            type: 'grayscale',
        },
        blue: {
            label: 'Blue',
            type: 'grayscale',
        },
        alpha: {
            label: 'Alpha',
            type: 'grayscale',
        },
    },
});
