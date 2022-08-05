import { wgsl } from '../utils/wgsl';

import { noiseHelpers } from './shared/noise';
import { createShaderDescriptor } from './shared/shader-descriptor';

// https://en.wikipedia.org/wiki/Perlin_noise
//
const SOURCE = wgsl`
    ${noiseHelpers}


    fn run(coordinate: vec2<f32>) -> Output {
        var pos = coordinate * f32(config.scale);

        var pos_whole = floor(pos);
        var pos_fract = fract(pos);

        var upperLeft = dot(rand2(pos_whole), pos_fract);
        var upperRight = dot(rand2(pos_whole + vec2(1, 0)), pos_fract - vec2(1, 0));
        var lowerLeft = dot(rand2(pos_whole + vec2(0, 1)), pos_fract - vec2(0, 1));
        var lowerRight = dot(rand2(pos_whole + vec2(1, 1)), pos_fract - vec2(1, 1));

        var interpolateX = smoothstep(0.0, 1.0, pos_fract.x);
        var interpolateY = smoothstep(0.0, 1.0, pos_fract.y);

        var upper = mix(upperLeft, upperRight, interpolateX);
        var lower = mix(lowerLeft, lowerRight, interpolateX);

        return Output(mix(upper, lower, interpolateY) * 0.5 + 0.5);
    }
`;

export default createShaderDescriptor({
    id: '#perlin-noise',
    label: 'Perlin Noise',
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
