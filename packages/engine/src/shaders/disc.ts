import { wgsl } from '../utils/wgsl';
import { createShaderDescriptor } from './shared/shader-descriptor';

const SOURCE = wgsl`
    const CENTER = vec2<f32>(0.5, 0.5);

    fn run(coordinate: vec2<f32>) -> Output {
        var value = step(distance(coordinate, CENTER), config.size / 2.0);
        return Output(value);
    }
`;

export default createShaderDescriptor({
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
});
