import { wgsl } from '../utils/wgsl';

import { noiseHelpers } from './shared/noise';
import { createShaderDescriptor } from './shared/shader-descriptor';

// https://www.ronja-tutorials.com/post/025-value-noise/#interpolate-cells-in-two-dimensions
const SOURCE = wgsl`
    ${noiseHelpers}

    fn run(coordinate: vec2<f32>) -> Output {
        var pos = coordinate * f32(config.scale);

        var pos_whole = floor(pos);
        var pos_fract = fract(pos);

        var upperLeft = rand(pos_whole);
        var upperRight = rand(pos_whole + vec2(1, 0));
        var lowerLeft = rand(pos_whole + vec2(0, 1));
        var lowerRight = rand(pos_whole + vec2(1, 1));

        var interpolateX = smoothstep(0.0, 1.0, pos_fract.x);
        var interpolateY = smoothstep(0.0, 1.0, pos_fract.y);

        var upper = mix(upperLeft, upperRight, interpolateX);
        var lower = mix(lowerLeft, lowerRight, interpolateX);

        return Output(mix(upper, lower, interpolateY));
    }
`;

export default createShaderDescriptor({
    id: '#value-noise',
    label: 'Value Noise',
    source: SOURCE,
    properties: {
        scale: {
            label: 'Scale',
            type: 'int1',
            description: 'The global scale of the noise.',
            default: [8],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
});
