import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const SOURCE = wgsl`
    const CENTER = vec2<f32>(0.5, 0.5);

    fn run(coordinate: vec2<f32>) -> Output {
        var value = step(distance(coordinate, CENTER), config.size / 2.0);
        return Output(value);
    }
`;

export const DISC: ShaderDescriptor = {
    id: '#disc',
    label: 'Disc',
    source: SOURCE,
    properties: {
        size: {
            label: 'Size',
            type: 'float1',
            description: 'The disc size.',
            default: [1],
        },
    },
    inputs: {},
    outputs: {
        output: {
            label: 'Output',
            type: 'grayscale',
        },
    },
};
