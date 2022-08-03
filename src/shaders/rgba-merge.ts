import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var red = textureSample(red_texture, red_sampler, coordinate).x;
        var green = textureSample(green_texture, green_sampler, coordinate).x;
        var blue = textureSample(blue_texture, blue_sampler, coordinate).x;
        var alpha = textureSample(alpha_texture, alpha_sampler, coordinate).x;

        return Output(vec4(red, green, blue, alpha));
    }
`;

export default createShaderDescriptor({
    id: '#rgba-merge',
    label: 'RGBA Merge',
    source: SOURCE,
    properties: {},
    inputs: {
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
    outputs: {
        output: {
            label: 'Output',
            type: 'color',
        },
    },
});
