import { wgsl } from '../utils/wgsl';

import { createShaderDescriptor } from './shared/shader-descriptor';

// https://www.geeks3d.com/hacklab/20190225/demo-checkerboard-in-glsl/
const SOURCE = wgsl`
    fn rotate(v: vec2<f32>, angle: f32) -> vec2<f32> {
        var c = cos(angle);
        var s = sin(angle);

        var m = mat2x2(
            c, -s,
            s, c
        );

        return v * m;
    }

    fn run(coordinate: vec2<f32>) -> Output {
        var position = floor(2 * f32(config.tiling) * coordinate);
        return Output((position.x + position.y) % 2.0);
    }
`;

export default createShaderDescriptor({
    id: '#checker',
    label: 'Checker',
    source: SOURCE,
    properties: {
        tiling: {
            label: 'Tiling',
            type: 'int1',
            description: 'Number of time the pattern repeats.',
            default: [1],
        },
        // TODO: Add rotation
        rotate_45: {
            label: 'Rotate 45°',
            type: 'boolean',
            description: 'Rotate the pattern by 45°.',
            default: false,
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
