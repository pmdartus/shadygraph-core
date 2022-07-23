import { wgsl } from '../utils/wgsl';

import { colorHelpers } from './shared/color';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    ${colorHelpers}

    fn run(coordinate: vec2<f32>) -> Output {
        var val = textureSample(input_texture, input_sampler, coordinate).rgb;
        return Output(rgb_to_grayscale(val));
    }
`;

export default createShaderDescriptor({
    id: '#color-to-grayscale',
    label: 'Color to Grayscale',
    source: SOURCE,
    properties: {
        // TODO: Hanlde case where shader defines no properties.
        placeholder: {
            label: 'placeholder',
            type: 'boolean',
            description: 'Placeholder.',
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
            type: 'grayscale',
        },
    },
});
