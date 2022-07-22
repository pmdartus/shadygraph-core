import { ShaderDescriptor } from '../types';
import { wgsl } from '../utils/wgsl';

const SOURCE = wgsl`
    const CENTER = vec2<f32>(0.5, 0.5);

    fn run(coordinate: vec2<f32>) -> Output {
        var normalized_coordinate = abs(coordinate - CENTER);
        var value = (
            step(normalized_coordinate.x, config.size / 2.0) * 
            step(normalized_coordinate.y, config.size / 2.0)
        );
        return Output(value);
    }
`;

export const SQUARE: ShaderDescriptor = {
    id: '#square',
    label: 'Square',
    source: SOURCE,
    properties: {
        size: {
            label: 'Size',
            type: 'float1',
            description: 'The square size.',
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
