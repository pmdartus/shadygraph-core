import { wgsl } from '../utils/wgsl';

import { noiseHelpers } from './shared/noise';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    ${noiseHelpers}

    fn run(coordinate: vec2<f32>) -> Output {
        var value = rand(coordinate);
        return Output(value);
    }
`;

export default createShaderDescriptor({
    id: '#white-noise',
    label: 'White Noise',
    source: SOURCE,
    properties: {},
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
});
