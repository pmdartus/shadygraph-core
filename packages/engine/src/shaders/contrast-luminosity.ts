import { wgsl } from '../utils/wgsl';

import { createShaderDescriptor } from './shared/shader-descriptor';

// https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-4-brightness-adjustment/
// https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/brightnesscontrast.js
const SOURCE = wgsl`
    fn run(coordinate: vec2<f32>) -> Output {
        var value = textureSample(input_texture, input_sampler, coordinate);
        var color = value.rgb;
        
        color += config.luminosity;
        color = (color - 0.5) / (1 - config.contrast) + 0.5;

        return Output(vec4<f32>(color, value.a));
    }
`;

export default createShaderDescriptor({
    id: '#contrast-luminosity',
    label: 'Contrast/Luminosity',
    source: SOURCE,
    properties: {
        contrast: {
            label: 'Contrast',
            type: 'float1',
            description: 'Adjust the input contrast.',
            default: [0],
        },
        luminosity: {
            label: 'Luminosity',
            type: 'float1',
            description: 'Adjust the input luminosity.',
            default: [0],
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
});
